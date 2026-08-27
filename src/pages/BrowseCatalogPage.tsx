import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, Container, Row, Col, Table } from "react-bootstrap";
import axios from "axios";
import { browseReleases } from "../services/browseService";
import { discogsUserService } from "../services/discogsUserService";
import { useAuth } from "../contexts/AuthContext";
import { discogsAuthStorage } from "../services/discogsAuthStorage";
import type { SearchResult } from "../types/search";
import AlbumListItem from "../components/AlbumListItem";
import GenreFilter from "../components/GenreFilter";
import StyleFilter from "../components/StyleFilter";
import Pagination from "../components/Pagination";
import BrowseCatalogTableSkeleton from "../components/skeletons/BrowseCatalogTableSkeleton";

const BrowseCatalogPage = () => {
    const [searchParams] = useSearchParams();
    const genre = searchParams.get("genre") || undefined;
    const style = searchParams.get("style") || undefined;
    const page = Number(searchParams.get("page")) || 1;
    const filterLabel = [genre, style].filter(Boolean).join(" / ");

    const { user } = useAuth();
    const connection = user ? discogsAuthStorage.getConnection(user.id) : null;

    const [albums, setAlbums] = useState<SearchResult[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Maps a Discogs release id -> the user's existing collection entry (if
    // any), fetched ONCE per page load rather than once per row — avoids
    // firing dozens of simultaneous authenticated requests when the table
    // renders many albums at once.
    const [collectionMap, setCollectionMap] = useState<Map<number, { instance_id: number; rating: number }>>(new Map());

    useEffect(() => {
        const fetchAlbums = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await browseReleases({ genre, style, page });
                setAlbums(data.results);
                setTotalPages(data.pagination.pages);
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
    }, [genre, style, page]);

    useEffect(() => {
        if (!connection) return;

        const fetchCollection = async () => {
            try {
                const data = await discogsUserService.getCollection(connection.discogsUsername, connection);
                const map = new Map(
                    data.releases.map((r) => [r.basic_information.id, { instance_id: r.instance_id, rating: r.rating }])
                );
                setCollectionMap(map);
            } catch {
                // fail quietly — rows just won't pre-fill, user can still click Save
            }
        };

        void fetchCollection();
    }, [connection]);

    return (
        <Container fluid="lg" className="py-4">
            <h2>Browse Catalog{filterLabel ? ` — ${filterLabel}` : ""}</h2>
            <Row className="g-3 align-items-end mb-3">
                <Col xs={12} sm={6} md={4}>
                    <GenreFilter />
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <StyleFilter />
                </Col>
            </Row>
            {loading && <BrowseCatalogTableSkeleton />}
            {error && <Alert variant="danger">{error}</Alert>}
            {!loading && !error && !albums.length && <p>No albums found.</p>}
            {!loading && !error && albums.length > 0 && (
                <div className="table-responsive">
                    <Table striped hover className="browse-catalog-table align-middle">
                        <thead>
                        <tr>
                            <th>Title</th>
                            <th>Artist</th>
                            <th>Year</th>
                            <th>Genre</th>
                            <th>Rate / Collect</th>
                        </tr>
                        </thead>
                        <tbody>
                        {albums.map((album) => (
                            <AlbumListItem key={album.id} album={album} existingEntry={collectionMap.get(album.id)} />
                        ))}
                        </tbody>
                    </Table>
                </div>
            )}
            {!loading && !error && albums.length > 0 && (
                <Pagination currentPage={page} totalPages={totalPages} />
            )}
        </Container>
    );
};

export default BrowseCatalogPage;