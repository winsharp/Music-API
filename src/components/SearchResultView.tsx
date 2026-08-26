import type { SearchResult } from "../types/search";

interface SearchResultViewProps {
    result: SearchResult;
}

const SearchResultView = ({ result }: SearchResultViewProps) => {
    const handleTitleClick = () => {
        //navigate to album/artist detail page once that route exists
        console.log("Clicked:", result.title);
    };

    const handleGenreClick = (genre: string) => {
        // navigate to genre-filtered results once that route exists
        console.log("Clicked genre:", genre);
    };
    return (
        <div>
            {result.thumb && <img src={result.thumb} alt={result.title} />}
            <button type="button" onClick={handleTitleClick}>
                <h3>{result.title}</h3>
            </button>
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