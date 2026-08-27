import SelectFilter from "./SelectFilter";
import { DISCOGS_STYLES } from "../constants/styles";

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
