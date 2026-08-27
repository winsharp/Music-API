import { useNavigate, useSearchParams } from "react-router-dom";
import { Form } from "react-bootstrap";
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
        <Form.Group controlId="style-filter">
            <Form.Label>Styles:</Form.Label>
            <Form.Select value={selectedStyle} onChange={handleChange}>
                <option value="">All Styles</option>
                {DISCOGS_STYLES.map((style) => (
                    <option key={style} value={style}>
                        {style}
                    </option>
                ))}
            </Form.Select>
        </Form.Group>
    );
};

export default StyleFilter;
