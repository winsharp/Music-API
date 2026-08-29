import { Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import type { DiscogsReleaseDetail } from "../types/discogsRelease";
import MediaCard from "./MediaCard";
import ArtistLink from "./ArtistLink";
import { UNKNOWN_ARTIST } from "../utils/parseAlbumTitle";

interface FeaturedReleaseCardProps {
    release: DiscogsReleaseDetail;
    stat: string;
}

/**
 * A single card in the homepage's featured-releases carousels (Most
 * Collected / Most Valuable / Best Selling). Wraps `MediaCard` with the
 * release's primary artist and a caller-provided `stat` line (e.g. a
 * have/want count or price), and navigates to the release page on click.
 */
const FeaturedReleaseCard = ({ release, stat }: FeaturedReleaseCardProps) => {
    const artist = release.artists?.[0]?.name ?? UNKNOWN_ARTIST;
    const navigate = useNavigate();

    const handleTitleClick = () => {
        navigate(`/release/${release.id}`);
    };

    return (
        <Col>
            <MediaCard thumb={release.thumb} alt={release.title} title={release.title} onClick={handleTitleClick}>
                <ArtistLink artist={artist} />
                <p className="mb-0 small fw-semibold">{stat}</p>
            </MediaCard>
        </Col>
    );
};

export default FeaturedReleaseCard;
