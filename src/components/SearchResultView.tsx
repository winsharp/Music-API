import { useNavigate } from "react-router-dom";
import type { SearchResult } from "../types/search";
import { parseAlbumTitle } from "../utils/parseAlbumTitle";

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
        <div>
            {result.thumb && <img src={result.thumb} alt={title} />}
            <button type="button" onClick={handleTitleClick}>
                <h3>{title}</h3>
            </button>
            {hasKnownArtist ? (
                <button type="button" onClick={handleArtistClick}>
                    {artist}
                </button>
            ) : (
                <p>{artist}</p>
            )}
            <p>{result.year}</p>
            {result.genre && (
                <p>
                    {result.genre.map((g) => (
                        <button type="button" key={g} onClick={() => handleGenreClick(g)}>
                            {g}
                        </button>
                    ))}
                </p>
            )}
        </div>
    );
};

export default SearchResultView;
