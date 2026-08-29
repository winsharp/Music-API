import { Card, Col, Placeholder, Row } from "react-bootstrap";
import "../../styles/mediaThumb.css";

interface CardGridSkeletonProps {
    count?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    /**
     * Search result cards show a row of genre badges below the text; the
     * other card grids (collection, wantlist, recently rated) don't.
     */
    showBadgeRow?: boolean;
}

/** Loading placeholder for a responsive grid of `MediaCard`s. */
const CardGridSkeleton = ({
    count = 8,
    xs = 2,
    sm = 3,
    md = 4,
    lg = 5,
    showBadgeRow = false,
}: CardGridSkeletonProps) => (
    <Row xs={xs} sm={sm} md={md} lg={lg} className="g-3">
        {Array.from({ length: count }).map((_, i) => (
            <Col key={i}>
                <Card className="h-100">
                    <Placeholder as="div" animation="glow">
                        <Placeholder className="media-thumb" style={{ borderRadius: 0 }} />
                    </Placeholder>
                    <Card.Body className="p-2">
                        <Placeholder as="p" animation="glow" className="mb-1">
                            <Placeholder xs={8} />
                        </Placeholder>
                        <Placeholder as="p" animation="glow" className="mb-0">
                            <Placeholder xs={4} size="sm" />
                        </Placeholder>
                        {showBadgeRow && (
                            <Placeholder as="div" animation="glow" className="mt-2 d-flex gap-1">
                                <Placeholder xs={3} size="sm" />
                                <Placeholder xs={3} size="sm" />
                            </Placeholder>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        ))}
    </Row>
);

export default CardGridSkeleton;
