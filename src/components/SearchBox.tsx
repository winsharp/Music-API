//Search box component
//
import { useState} from "react";
import {useNavigate} from "react-router-dom";

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
      <form onSubmit={handleSubmit}>
          <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for an album, artist..."
          />
          <button type="submit">Search</button>
      </form>
    );
};

export default SearchBox;