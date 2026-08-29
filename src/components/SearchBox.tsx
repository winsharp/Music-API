import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, InputGroup, Button } from "react-bootstrap";

/**
 * The search input shown in the NavBar. On submit, navigates to
 * `/search?q=...` with the trimmed query (ignores empty/whitespace-only
 * submissions); `SearchPage` reads the `q` param and performs the actual
 * Discogs search.
 */
const SearchBox = () => {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent)=>{
        e.preventDefault();
        const trimmed = query.trim();
        if(!trimmed) return;

        const params = new URLSearchParams({q: trimmed});

        navigate(`/search?${params.toString()}`);
    };

    return(
      <Form onSubmit={handleSubmit} className="w-100">
          <InputGroup>
              <Form.Control
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for an album, artist..."
                  aria-label="Search for an album, artist..."
              />
              <Button type="submit" variant="outline-secondary">
                  Search
              </Button>
          </InputGroup>
      </Form>
    );
};

export default SearchBox;
