import {useEffect, useState} from "react";
import{useSearchParams} from "react-router-dom";
import {Alert, Container, Row} from "react-bootstrap";
import {searchReleases} from "../services/searchService";
import type {SearchResult} from "../types/search";
import SearchResultView from "../components/SearchResultView";
import CardGridSkeleton from "../components/skeletons/CardGridSkeleton";
import Pagination from "../components/Pagination";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import { usePageParam } from "../hooks/usePageParam";

const SearchPage = () =>{
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q")|| "";
    const genre = searchParams.get("genre")||undefined;
    const page = usePageParam();

    const [results,setResults] = useState<SearchResult[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState<string|null>(null);

    useEffect(()=>{
        if(!query) return;

        const fetchResults = async() =>{
            setLoading(true);
            setError(null);
            try {
                const data = await searchReleases({query, genre, page});
                setResults(data.results);
                setTotalPages(data.pagination.pages);
            } catch (err) {
                console.error(err);
                setError(getApiErrorMessage(err));
            }finally {
                setLoading(false);
            }
        };
            fetchResults();
            },[query,genre,page]);
    if(loading)return(
        <Container fluid="lg" className="py-4">
            <CardGridSkeleton count={8} xs={2} sm={2} md={3} lg={4} showBadgeRow />
        </Container>
    );
    if(error)return(
        <Container fluid="lg" className="py-4">
            <Alert variant="danger">{error}</Alert>
        </Container>
    );
    if(!results.length) return (
        <Container fluid="lg" className="py-4">
            <p>No results found.</p>
        </Container>
    );

    return(
        <Container fluid="lg" className="py-4">
            <h2>
                Results for "{query}"{genre ? ` in ${genre}`:""}
            </h2>
            <Row xs={2} sm={2} md={3} lg={4} className="g-3">
                {results.map((result)=>(
                    <SearchResultView key={result.id} result={result}/>
                ))}
            </Row>
            <Pagination currentPage={page} totalPages={totalPages} basePath="/search" />
        </Container>
    );
};

export default SearchPage;