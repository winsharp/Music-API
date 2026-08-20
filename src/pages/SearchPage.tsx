import {useEffect, useState} from "react";
import{useSearchParams} from "react-router-dom";
import {searchReleases} from "../services/searchService";
import type {SearchResult} from "../types/search";
import SearchResultView from "../components/SearchResultView";
import axios from "axios";

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
            } catch (err) {
                console.error(err);
                if (axios.isAxiosError(err)) {
                    if (!err.response) {
                        setError("Couldn't reach Discogs — check your internet connection and try again.");
                    } else {
                        const status = err.response.status;
                        if (status === 401) {
                            setError("Discogs rejected the request — the API token may be missing or invalid.");
                        } else if (status === 429) {
                            setError("Too many requests right now — the Discogs API rate limit was hit. Please wait a moment and try again.");
                        } else if (status === 500) {
                            const message = err.response.data?.message;
                            setError(message ? `Discogs server error: ${message}` : "Discogs is having server issues right now. Please try again later.");
                        } else {
                            setError("Something went wrong fetching results. Please try again.");
                        }
                    }
                } else {
                    setError("Something went wrong fetching results. Please try again.");
                }
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