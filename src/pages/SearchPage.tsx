import {useEffect, useState} from "react";
import{useSearchParams} from "react-router-dom";
import {searchReleases} from "../services/searchService";
import type {SearchResult} from "../types/search";
import SearchResultView from "../components/SearchResultView";

const SearchPage = () =>{
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q")|| "";
    const genre = searchParams.get("genre")||undefined;

    const [results,setResults] = useState<SearchResult[]>([]);
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState<string|null>(null);

    useEffect(()=>{
        if(!query) return;

        const fetchResults = async() =>{
            setLoading(true);
            setError(null);
            try {
                const data = await searchReleases({query, genre});
                setResults(data.results);
            }catch (err) {
                console.error(err);
                setError("something went wrong fetching results. Please try again.");
            }finally {
                setLoading(false);
            }
        };
            fetchResults();
            },[query,genre]);
    if(loading)return<p>Loading...</p>;
    if(error)return<p>{error}</p>;
    if(!results.length) return <p>No results found.</p>;

    return(
        <div>
            <h2>
                Results for "{query}"{genre ? ` in ${genre}`:""}
            </h2>
            <div>
                {results.map((result)=>(
                    <SearchResultView key={result.id} result={result}/>
                ))}
            </div>
        </div>
    );
};

export default SearchPage;