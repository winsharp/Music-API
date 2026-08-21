import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GenreFilter from './GenreFilter';
import '@testing-library/jest-dom';

// Mock React Router's navigation and query params
const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
}));

describe('GenreFilter Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSearchParams = new URLSearchParams();
    });

    it('renders "All Genres" plus each Discogs genre option', () => {
        render(<GenreFilter />);

        expect(screen.getByRole('option', { name: 'All Genres' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Jazz' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Rock' })).toBeInTheDocument();
    });

    it('navigates to /browse with the selected genre as a query param', async () => {
        render(<GenreFilter />);

        await userEvent.selectOptions(screen.getByRole('combobox'), 'Jazz');

        expect(mockNavigate).toHaveBeenCalledWith('/browse?genre=Jazz');
    });

    it('navigates to /browse with no query param when "All Genres" is selected', async () => {
        mockSearchParams = new URLSearchParams('genre=Jazz');
        render(<GenreFilter />);

        await userEvent.selectOptions(screen.getByRole('combobox'), 'All Genres');

        expect(mockNavigate).toHaveBeenCalledWith('/browse');
    });

    it('reflects the current genre from the URL', () => {
        mockSearchParams = new URLSearchParams('genre=Rock');
        render(<GenreFilter />);

        expect(screen.getByRole('combobox')).toHaveValue('Rock');
    });
});
