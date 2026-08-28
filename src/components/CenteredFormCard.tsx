import type { ReactNode } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";

interface CenteredFormCardProps {
    title: string;
    children: ReactNode;
}

/**
 * Shared layout shell for the Login/Register/Settings pages: a card
 * centered in a narrow column, with a heading. Keeps sizing and spacing
 * consistent without each page re-declaring the same
 * Container/Row/Col/Card nesting.
 */
const CenteredFormCard = ({ title, children }: CenteredFormCardProps) => (
    <Container fluid="sm" className="py-4">
        <Row className="justify-content-center">
            <Col xs={12} sm={10} md={6} lg={4}>
                <Card>
                    <Card.Body>
                        <h1 className="h3 mb-3">{title}</h1>
                        {children}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    </Container>
);

export default CenteredFormCard;
