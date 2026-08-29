import SelectFilter from "./SelectFilter";
import { DISCOGS_GENRES } from "../constants/genres";

/** `SelectFilter` preconfigured for the "genre" query param on `/browse`. */
const GenreFilter = () => (
    <SelectFilter
        controlId="genre-filter"
        label="Genre:"
        paramName="genre"
        options={DISCOGS_GENRES}
        allLabel="All Genres"
        basePath="/browse"
    />
);

export default GenreFilter;
