import { Card, Col, Placeholder, Row } from "react-bootstrap";
import "../../styles/mediaThumb.css";

interface CardGridSkeletonProps {
    count?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    // Search result cards show a row of genre badges below the text; the
    // other card grids (collection, wantlist, recently rated) don't.
    showBadgeRow?: boolean;
    // Lists cards are text-only (title + description + items), no thumbnail.
    showImage?: boolean;
}

const CardGridSkeleton = ({
    count = 8,
    xs = 2,
    sm = 3,
    md = 4,
    lg = 5,
    showBadgeRow = false,
    showImage = true,
}: CardGridSkeletonProps) => (
    <Row xs={xs} sm={sm} md={md} lg={lg} className="g-3">
        {Array.from({ length: count }).map((_, i) => (
            <Col key={i}>
                <Card className="h-100">
                    {showImage && (
                        <Placeholder as="div" animation="glow">
                            <Placeholder className="media-thumb" style={{ borderRadius: 0 }} />
                        </Placeholder>
                    )}
                    <Card.Body className={showImage ? "p-2" : undefined}>
                        <Placeholder as="p" animation="glow" className="mb-1">
                            <Placeholder xs={8} />
                        </Placeholder>
                        <Placeholder as="p" animation="glow" className="mb-0">
                            <Placeholder xs={4} size="sm" />
                        </Placeholder>
                        {!showImage && (
                            <Placeholder as="p" animation="glow" className="mb-0 mt-1">
                                <Placeholder xs={10} size="sm" />
                            </Placeholder>
                        )}
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
