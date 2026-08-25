import { useNavigate, useSearchParams } from "react-router-dom";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

const Pagination = ({ currentPage, totalPages }: PaginationProps) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams);
        if (page <= 1) {
            params.delete("page");
        } else {
            params.set("page", String(page));
        }
        navigate(`/browse${params.toString() ? `?${params.toString()}` : ""}`);
    };

    if (totalPages <= 1) return null;

    return (
        <div>
            <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
                Previous
            </button>
            <span>
                {" "}
                Page {currentPage} of {totalPages}{" "}
            </span>
            <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>
                Next
            </button>
        </div>
    );
};

export default Pagination;
