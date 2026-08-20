import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchBox from '../components/SearchBox';
import '@testing-library/jest-dom';

// Mock React Router's navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

describe('SearchBox Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders input field and search button accurately', () => {
        render(<SearchBox />);

        expect(screen.getByPlaceholderText('Search for an album, artist...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('updates text value when user types', async () => {
        render(<SearchBox />);
        const input = screen.getByPlaceholderText('Search for an album, artist...') as HTMLInputElement;

        await userEvent.type(input, 'Interstellar');
        expect(input.value).toBe('Interstellar');
    });

    it('prevents form submission if input is empty or whitespace only', async () => {
        render(<SearchBox />);
        const button = screen.getByRole('button', { name: /search/i });

        await userEvent.click(button);
        expect(mockNavigate).not.toHaveBeenCalled();

        const input = screen.getByPlaceholderText('Search for an album, artist...');
        await userEvent.type(input, '   ');
        await userEvent.click(button);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('navigates to search page with correct query string on submission', async () => {
        render(<SearchBox />);
        const input = screen.getByPlaceholderText('Search for an album, artist...');
        const button = screen.getByRole('button', { name: /search/i });

        await userEvent.type(input, 'Random Access Memories');
        await userEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith('/search?q=Random+Access+Memories');
    });

    it('includes genre inside query parameters if category prop is passed', async () => {
        render(<SearchBox category="Electronic" />);
        const input = screen.getByPlaceholderText('Search for an album, artist...');
        const button = screen.getByRole('button', { name: /search/i });

        await userEvent.type(input, 'Discovery');
        await userEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith('/search?q=Discovery&genre=Electronic');
    });
});
