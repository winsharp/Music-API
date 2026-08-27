import { useSearchParams } from "react-router-dom";

/**
 * Reads the current 1-based `page` query param (defaulting to 1 when it's
 * missing or not a valid number) — shared by every paginated list page
 * (Search, Browse Catalog, Artist releases).
 */
export function usePageParam(): number {
    const [searchParams] = useSearchParams();
    return Number(searchParams.get("page")) || 1;
}
