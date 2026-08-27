import { ListGroup, Placeholder } from "react-bootstrap";

// Mirrors the real ReleasePage layout: title, artist line, year, genre,
// then a numbered tracklist.
const ReleaseDetailSkeleton = () => (
    <>
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
            <Placeholder xs={3} />
        </Placeholder>
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
    </>
);

export default ReleaseDetailSkeleton;
