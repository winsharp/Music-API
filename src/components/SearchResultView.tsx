import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Col } from "react-bootstrap";
import type { SearchResult } from "../types/search";
import { parseAlbumTitle } from "../utils/parseAlbumTitle";
import "../styles/mediaThumb.css";

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

    const handleGenreClick = (genre: string) => {
        // navigate to genre-filtered results once that route exists
        console.log("Clicked genre:", genre);
    };

    return (
        <Col>
            <Card className="h-100">
                {result.thumb ? (
                    <Card.Img variant="top" className="media-thumb" src={result.thumb} alt={title} />
                ) : (
                    <div className="media-thumb media-thumb-placeholder" />
                )}
                <Card.Body>
                    <Button
                        variant="link"
                        className="p-0 text-start text-decoration-none d-block"
                        onClick={handleTitleClick}
                    >
                        <Card.Title as="h3" className="h6 mb-1">
                            {title}
                        </Card.Title>
                    </Button>
                    {hasKnownArtist ? (
                        <Button variant="link" className="p-0 text-start" onClick={handleArtistClick}>
                            {artist}
                        </Button>
                    ) : (
                        <p className="mb-0">{artist}</p>
                    )}
                    <Card.Text>{result.year}</Card.Text>
                    {result.genre && (
                        <div className="d-flex flex-wrap gap-1">
                            {result.genre.map((g) => (
                                <Badge
                                    as="button"
                                    type="button"
                                    key={g}
                                    bg="secondary"
                                    className="border-0"
                                    onClick={() => handleGenreClick(g)}
                                >
                                    {g}
                                </Badge>
                            ))}
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Col>
    );
};

export default SearchResultView;
