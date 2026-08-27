import { useNavigate } from "react-router-dom";
import { Badge, Col } from "react-bootstrap";
import type { SearchResult } from "../types/search";
import { parseAlbumTitle } from "../utils/parseAlbumTitle";
import MediaCard from "./MediaCard";
import ArtistLink from "./ArtistLink";

interface SearchResultViewProps {
    result: SearchResult;
}

const SearchResultView = ({ result }: SearchResultViewProps) => {
    const navigate = useNavigate();
    const { artist, title } = parseAlbumTitle(result.title);

    const handleTitleClick = () => {
        navigate(`/release/${result.id}`);
    };

    const handleGenreClick = (e: React.MouseEvent) => {
        // Stop the click from bubbling up to the surrounding card, which
        // navigates to the release instead.
        e.stopPropagation();
    };

    return (
        <Col>
            <MediaCard thumb={result.thumb} alt={title} title={title} onClick={handleTitleClick}>
                <ArtistLink artist={artist} />
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
