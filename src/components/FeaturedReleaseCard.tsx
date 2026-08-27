import { Button, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import type { DiscogsReleaseDetail } from "../types/discogsRelease";
import MediaCard from "./MediaCard";

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
            <MediaCard thumb={release.thumb} alt={release.title} title={release.title} onClick={handleTitleClick}>
                {hasKnownArtist ? (
                    <Button
                        variant="link"
                        className="p-0 text-start d-block mb-1 media-card-subtitle"
                        onClick={handleArtistClick}
                    >
                        {artist}
                    </Button>
                ) : (
                    <p className="mb-1 media-card-subtitle">{artist}</p>
                )}
                <p className="mb-0 small fw-semibold">{stat}</p>
            </MediaCard>
        </Col>
    );
};

export default FeaturedReleaseCard;
