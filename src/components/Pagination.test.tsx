import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Pagination from './Pagination';
import '@testing-library/jest-dom';

const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
}));

describe('Pagination Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSearchParams = new URLSearchParams();
    });

    it('renders nothing when there is only one page', () => {
        const { container } = render(<Pagination currentPage={1} totalPages={1} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('shows the current page and total pages', () => {
        render(<Pagination currentPage={2} totalPages={5} />);
        expect(screen.getByText(/Page 2 of 5/)).toBeInTheDocument();
    });

    it('disables "Previous" on the first page', () => {
        render(<Pagination currentPage={1} totalPages={5} />);
        expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    });

    it('disables "Next" on the last page', () => {
        render(<Pagination currentPage={5} totalPages={5} />);
        expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    });

    it('navigates to the next page, preserving other query params', async () => {
        mockSearchParams = new URLSearchParams('genre=Jazz&page=2');
        render(<Pagination currentPage={2} totalPages={5} />);

        await userEvent.click(screen.getByRole('button', { name: /next/i }));

        expect(mockNavigate).toHaveBeenCalledWith('/browse?genre=Jazz&page=3');
    });

    it('drops the page param entirely when navigating back to page 1', async () => {
        mockSearchParams = new URLSearchParams('genre=Jazz&page=2');
        render(<Pagination currentPage={2} totalPages={5} />);

        await userEvent.click(screen.getByRole('button', { name: /previous/i }));

        expect(mockNavigate).toHaveBeenCalledWith('/browse?genre=Jazz');
    });
});
