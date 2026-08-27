import { useNavigate } from "react-router-dom";
import { Badge, Button, Col } from "react-bootstrap";
import type { SearchResult } from "../types/search";
import { parseAlbumTitle } from "../utils/parseAlbumTitle";
import MediaCard from "./MediaCard";

interface SearchResultViewProps {
    result: SearchResult;
}

const SearchResultView = ({ result }: SearchResultViewProps) => {
    const navigate = useNavigate();
    const { artist, title } = parseAlbumTitle(result.title);
    // parseAlbumTitle falls back to this literal string when a result's
    // title has no "Artist - Title" separator to split on — not a real
    // artist to look up on Discogs, so don't make it clickable.
    const hasKnownArtist = artist !== "Unknown Artist";

    const handleTitleClick = () => {
        navigate(`/release/${result.id}`);
    };

    const handleArtistClick = () => {
        navigate(`/artist?name=${encodeURIComponent(artist)}`);
    };

    const handleGenreClick = (e: React.MouseEvent) => {
        // Stop the click from bubbling up to the surrounding card, which
        // navigates to the release instead.
        e.stopPropagation();
    };

    return (
        <Col>
            <MediaCard thumb={result.thumb} alt={title} title={title} onClick={handleTitleClick}>
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
                <p className="mb-1 small">{result.year}</p>
                {result.genre && (
                    <div className="d-flex flex-wrap gap-1">
                        {result.genre.map((g) => (
                            <Badge
                                as="button"
                                type="button"
                                key={g}
                                bg="secondary"
                                className="border-0"
                                onClick={handleGenreClick}
                            >
                                {g}
                            </Badge>
                        ))}
                    </div>
                )}
            </MediaCard>
        </Col>
    );
};

export default SearchResultView;
