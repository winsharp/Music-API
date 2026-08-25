import { useNavigate, useSearchParams } from "react-router-dom";
import { DISCOGS_GENRES } from "../constants/genres";

const GenreFilter = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const selectedGenre = searchParams.get("genre") || "";

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams);
        const genre = e.target.value;
        if (genre) {
            params.set("genre", genre);
        } else {
            params.delete("genre");
        }
        params.delete("page");
        navigate(`/browse${params.toString() ? `?${params.toString()}` : ""}`);
    };

    return (
        <label>
            Genre:
            <select value={selectedGenre} onChange={handleChange}>
                <option value="">All Genres</option>
                {DISCOGS_GENRES.map((genre) => (
                    <option key={genre} value={genre}>
                        {genre}
                    </option>
                ))}
            </select>
        </label>
    );
};

export default GenreFilter;
