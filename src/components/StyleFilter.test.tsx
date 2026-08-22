import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StyleFilter from './StyleFilter';
import '@testing-library/jest-dom';

const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
}));

describe('StyleFilter Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSearchParams = new URLSearchParams();
    });

    it('renders "All Styles" plus each Discogs style option', () => {
        render(<StyleFilter />);

        expect(screen.getByRole('option', { name: 'All Styles' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'K-Pop' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Britpop' })).toBeInTheDocument();
    });

    it('navigates to /browse with the selected style as a query param', async () => {
        render(<StyleFilter />);

        await userEvent.selectOptions(screen.getByRole('combobox'), 'K-Pop');

        expect(mockNavigate).toHaveBeenCalledWith('/browse?style=K-Pop');
    });

    it('navigates to /browse with no style param when "All Styles" is selected', async () => {
        mockSearchParams = new URLSearchParams('style=K-Pop');
        render(<StyleFilter />);

        await userEvent.selectOptions(screen.getByRole('combobox'), 'All Styles');

        expect(mockNavigate).toHaveBeenCalledWith('/browse');
    });

    it('preserves the current genre filter when changing style', async () => {
        mockSearchParams = new URLSearchParams('genre=Rock');
        render(<StyleFilter />);

        await userEvent.selectOptions(screen.getByRole('combobox'), 'Britpop');

        expect(mockNavigate).toHaveBeenCalledWith('/browse?genre=Rock&style=Britpop');
    });

    it('resets the page param when the style changes', async () => {
        mockSearchParams = new URLSearchParams('style=K-Pop&page=3');
        render(<StyleFilter />);

        await userEvent.selectOptions(screen.getByRole('combobox'), 'Britpop');

        expect(mockNavigate).toHaveBeenCalledWith('/browse?style=Britpop');
    });

    it('reflects the current style from the URL', () => {
        mockSearchParams = new URLSearchParams('style=K-Pop');
        render(<StyleFilter />);
        expect(screen.getByRole('combobox')).toHaveValue('K-Pop');
    });
});
