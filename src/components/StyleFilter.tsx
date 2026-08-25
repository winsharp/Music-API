import { useNavigate, useSearchParams } from "react-router-dom";
import { DISCOGS_STYLES } from "../constants/styles";

const StyleFilter = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const selectedStyle = searchParams.get("style") || "";

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams);
        const style = e.target.value;
        if (style) {
            params.set("style", style);
        } else {
            params.delete("style");
        }
        params.delete("page");
        navigate(`/browse${params.toString() ? `?${params.toString()}` : ""}`);
    };

    return (
        <label>
            Styles:
            <select value={selectedStyle} onChange={handleChange}>
                <option value="">All Styles</option>
                {DISCOGS_STYLES.map((style) => (
                    <option key={style} value={style}>
                        {style}
                    </option>
                ))}
            </select>
        </label>
    );
};

export default StyleFilter;