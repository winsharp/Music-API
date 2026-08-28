import { Link } from "react-router-dom";
import { Col, Row } from "react-bootstrap";
import ReleaseGridCard, { type ReleaseGridCardItem } from "./ReleaseGridCard";

interface ReleaseGridProps<T extends ReleaseGridCardItem> {
    items: T[];
    getKey: (item: T) => string | number;
    /** Show the 0-5 star rating (and a "Not rated" label when it's 0). */
    showRating?: boolean;
    /** Only render the first `pageSize` items, with a "View All" link to see the rest. */
    pageSize?: number;
    /** Where the "View All" link points, e.g. `/profile/:username/collection`. */
    viewAllHref?: string;
}

/**
 * A responsive grid of ReleaseGridCards, optionally truncated to `pageSize`
 * items with a "View All" link — used for the Recently Rated, Collection,
 * and Wantlist sections on a profile (and their dedicated "View All" pages).
 */
function ReleaseGrid<T extends ReleaseGridCardItem>({
    items,
    getKey,
    showRating,
    pageSize,
    viewAllHref,
}: ReleaseGridProps<T>) {
    const visibleItems = pageSize ? items.slice(0, pageSize) : items;

    return (
        <>
            <Row xs={2} sm={3} md={4} lg={5} className="g-3">
                {visibleItems.map((item) => (
                    <Col key={getKey(item)}>
                        <ReleaseGridCard item={item} showRating={showRating} />
                    </Col>
                ))}
            </Row>
            {viewAllHref && pageSize && items.length > pageSize && (
                <div className="text-center mt-2">
                    <Link to={viewAllHref} className="btn btn-link btn-sm p-0 text-decoration-none">
                        View All
                    </Link>
                </div>
            )}
        </>
    );
}

export default ReleaseGrid;
