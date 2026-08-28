import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { UNKNOWN_ARTIST } from "../utils/parseAlbumTitle";

interface ArtistLinkProps {
    artist: string;
}

/**
 * Renders an artist's name inside a MediaCard body as a link to
 * /artist?name=... — unless it's the "Unknown Artist" placeholder used when
 * a release has no real artist data, in which case it's shown as plain text
 * instead of a dead-end link. Shared by every card that shows an artist
 * name below a release title (search results, featured releases, ...).
 */
const ArtistLink = ({ artist }: ArtistLinkProps) => {
    const navigate = useNavigate();

    if (artist === UNKNOWN_ARTIST) {
        return <p className="mb-1 media-card-subtitle">{artist}</p>;
    }

    return (
        <Button
            variant="link"
            className="p-0 text-start d-block mb-1 media-card-subtitle"
            onClick={() => navigate(`/artist?name=${encodeURIComponent(artist)}`)}
        >
            {artist}
        </Button>
    );
};

export default ArtistLink;
