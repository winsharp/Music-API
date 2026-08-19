///Takes component SearchResult and displays data handed to it

import type { SearchResult} from "../types/search";

interface SearchResultViewProps{
    result: SearchResult;
}
//{result.genre} && <p>{result.genre?.join(", ")}</p> for conditional rendering
const SearchResultView = ({ result}: SearchResultViewProps)=>{
  return(
      <div>
          <img src={result.thumb} alt={result.title}/>
          <h3>{result.title}</h3>
          <p>{result.year}</p>
          {result.genre && <p>{result.genre.join(", ")}</p>}
      </div>
  )
};

export default SearchResultView;