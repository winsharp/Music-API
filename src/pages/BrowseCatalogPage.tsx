import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { browseReleases } from "../services/browseService";
import type { SearchResult } from "../types/search";
import AlbumListItem from "../components/AlbumListItem";
import GenreFilter from "../components/GenreFilter";

const BrowseCatalogPage = () => {
    const [searchParams] = useSearchParams();
    const genre = searchParams.get("genre") || undefined;

    const [albums, setAlbums] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAlbums = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await browseReleases({ genre });
                setAlbums(data.results);
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
            } finally {
                setLoading(false);
            }
        };

        fetchAlbums();
    }, [genre]);

    return (
        <div>
            <h2>Browse Catalog{genre ? ` — ${genre}` : ""}</h2>
            <GenreFilter />
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && !albums.length && <p>No albums found.</p>}
            {!loading && !error && albums.length > 0 && (
                <div>
                    {albums.map((album) => (
                        <AlbumListItem key={album.id} album={album} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BrowseCatalogPage;
