import { Card, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import type { DiscogsReleaseDetail } from "../types/discogsRelease";

interface FeaturedReleaseCardProps {
    release: DiscogsReleaseDetail;
    stat: string;
}

const FeaturedReleaseCard = ({ release, stat }: FeaturedReleaseCardProps) => {
    const artist = release.artists?.[0]?.name ?? "Unknown Artist";
    const navigate = useNavigate();
    // Fallback used above when a release has no artist data - not a real
    // artist to look up, so don't make it clickable.
    const hasKnownArtist = artist !== "Unknown Artist";

    const handleTitleClick = () => {
        navigate(`/release/${release.id}`);
    };

    const handleArtistClick = () => {
        navigate(`/artist?name=${encodeURIComponent(artist)}`);
    };

    return (
        <Col>
            <Card className="featured-release-card h-100">
                {release.thumb && <Card.Img variant="top" src={release.thumb} alt={release.title} />}
                <Card.Body className="p-2">
                    <button type="button" className="featured-release-title-btn" onClick={handleTitleClick}>
                        {release.title}
                    </button>
                    {hasKnownArtist ? (
                        <button
                            type="button"
                            className="featured-release-title-btn featured-release-artist mb-0"
                            onClick={handleArtistClick}
                        >
                            {artist}
                        </button>
                    ) : (
                        <p className="featured-release-artist mb-0">{artist}</p>
                    )}
                    <p className="featured-release-stat mb-0">{stat}</p>
                </Card.Body>
            </Card>
        </Col>
    );
};

export default FeaturedReleaseCard;
