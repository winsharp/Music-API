import SelectFilter from "./SelectFilter";
import { DISCOGS_STYLES } from "../constants/styles";

/** `SelectFilter` preconfigured for the "style" query param on `/browse`. */
const StyleFilter = () => (
    <SelectFilter
        controlId="style-filter"
        label="Styles:"
        paramName="style"
        options={DISCOGS_STYLES}
        allLabel="All Styles"
        basePath="/browse"
    />
);

export default StyleFilter;
