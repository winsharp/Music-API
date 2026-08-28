import { useNavigate, useSearchParams } from "react-router-dom";
import { Form } from "react-bootstrap";

interface SelectFilterProps {
    controlId: string;
    label: string;
    paramName: string;
    options: readonly string[];
    allLabel: string;
    basePath: string;
}

/**
 * A `<select>` bound to a single query param on `basePath` — shared
 * implementation behind GenreFilter and StyleFilter (and any future catalog
 * filter), which only differ in which param/options/labels they use.
 * Changing the filter resets pagination, since the previous page number may
 * no longer be valid for the newly filtered result set.
 */
const SelectFilter = ({ controlId, label, paramName, options, allLabel, basePath }: SelectFilterProps) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const selected = searchParams.get(paramName) || "";

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams);
        const value = e.target.value;
        if (value) {
            params.set(paramName, value);
        } else {
            params.delete(paramName);
        }
        params.delete("page");
        navigate(`${basePath}${params.toString() ? `?${params.toString()}` : ""}`);
    };

    return (
        <Form.Group controlId={controlId}>
            <Form.Label>{label}</Form.Label>
            <Form.Select value={selected} onChange={handleChange}>
                <option value="">{allLabel}</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </Form.Select>
        </Form.Group>
    );
};

export default SelectFilter;
