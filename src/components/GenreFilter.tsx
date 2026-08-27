import SelectFilter from "./SelectFilter";
import { DISCOGS_GENRES } from "../constants/genres";

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
