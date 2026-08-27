//Search box component
//
import { useState} from "react";
import {useNavigate} from "react-router-dom";
import { Form, InputGroup, Button } from "react-bootstrap";

interface SearchBoxProps{
    category?: string;
}

const SearchBox = ({category}: SearchBoxProps)=>{
    //setQuery function updates memory which memory is represented as query.
    //query is empty until setQuery updates it
    //when setQuery gets used, the component gets a new value
    const [query, setQuery] = useState("");
    //React Router. gets a function to auto change the url. after user submits we'll send them to /search
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent)=>{
        e.preventDefault();
        const trimmed = query.trim();
        if(!trimmed) return;

        const params = new URLSearchParams({q: trimmed});
        if(category) params.set("genre", category);

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
