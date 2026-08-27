import { Card, Col } from "react-bootstrap";
import type { DiscogsReleaseDetail } from "../types/discogsRelease";

interface FeaturedReleaseCardProps {
    release: DiscogsReleaseDetail;
    stat: string;
}

const FeaturedReleaseCard = ({ release, stat }: FeaturedReleaseCardProps) => {
    const artist = release.artists?.[0]?.name ?? "Unknown Artist";

    const handleTitleClick = () => {
        // navigate to album/artist detail page once that route exists
        console.log("Clicked:", release.title);
    };

    return (
        <Col>
            <Card className="featured-release-card h-100">
                {release.thumb && <Card.Img variant="top" src={release.thumb} alt={release.title} />}
                <Card.Body className="p-2">
                    <button type="button" className="featured-release-title-btn" onClick={handleTitleClick}>
                        {release.title}
                    </button>
                    <p className="featured-release-artist mb-0">{artist}</p>
                    <p className="featured-release-stat mb-0">{stat}</p>
                </Card.Body>
            </Card>
        </Col>
    );
};

export default FeaturedReleaseCard;
