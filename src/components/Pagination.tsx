import { useNavigate, useSearchParams } from "react-router-dom";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    // Which page's URL to navigate within. Defaults to /browse since that
    // was Pagination's original (and still most common) home.
    basePath?: string;
}

/**
 * Previous/current/Next pager that navigates by setting/removing the `page`
 * query param on `basePath`, preserving any other existing search params
 * (e.g. genre/style filters, search query). Renders nothing when there's
 * only one page.
 */
const Pagination = ({ currentPage, totalPages, basePath = "/browse" }: PaginationProps) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams);
        if (page <= 1) {
            params.delete("page");
        } else {
            params.set("page", String(page));
        }
        navigate(`${basePath}${params.toString() ? `?${params.toString()}` : ""}`);
    };

    if (totalPages <= 1) return null;

    return (
        <ul className="pagination justify-content-center flex-wrap">
            <li className={`page-item${currentPage <= 1 ? " disabled" : ""}`}>
                <button
                    type="button"
                    className="page-link"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                >
                    Previous
                </button>
            </li>
            <li className="page-item disabled">
                <span className="page-link">
                    Page {currentPage} of {totalPages}
                </span>
            </li>
            <li className={`page-item${currentPage >= totalPages ? " disabled" : ""}`}>
                <button
                    type="button"
                    className="page-link"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    Next
                </button>
            </li>
        </ul>
    );
};

export default Pagination;
