import { Card, Col, ListGroup, Placeholder, Row } from "react-bootstrap";
import "../../styles/mediaThumb.css";

/**
 * Loading placeholder mirroring the real ReleasePage layout: a card with the
 * cover image and title/artist/year/genre info side by side, then a second
 * card with a numbered tracklist below.
 */
const ReleaseDetailSkeleton = () => (
    <>
        <Card className="p-3 p-md-4 mb-4">
            <Row className="g-4 align-items-center">
                <Col xs={5} sm={4} md={3} className="mx-auto mx-sm-0">
                    <Placeholder animation="glow">
                        <Placeholder className="media-thumb rounded" />
                    </Placeholder>
                </Col>
                <Col xs={12} sm={8} md={9}>
                    <Placeholder as="h2" animation="glow">
                        <Placeholder xs={5} />
                    </Placeholder>
                    <Placeholder as="p" animation="glow">
                        <Placeholder xs={3} />
                    </Placeholder>
                    <Placeholder as="p" animation="glow">
                        <Placeholder xs={2} />
                    </Placeholder>
                    <Placeholder as="p" animation="glow">
                        <Placeholder xs={4} />
                    </Placeholder>
                </Col>
            </Row>
        </Card>
        <Card className="p-3 p-md-4">
            <Placeholder as="h3" animation="glow">
                <Placeholder xs={2} />
            </Placeholder>
            <ListGroup as="ol" numbered className="mx-auto" style={{ maxWidth: 600 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <ListGroup.Item as="li" key={i} className="text-start">
                        <Placeholder as="span" animation="glow">
                            <Placeholder xs={6 + (i % 3)} />
                        </Placeholder>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Card>
    </>
);

export default ReleaseDetailSkeleton;
