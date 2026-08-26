import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getArtist, getArtistReleases, findArtistIdByName } from "../services/artistService";
import type { ArtistProfile, ArtistRelease } from "../types/artist";
import Pagination from "../components/Pagination";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import "../styles/catalogTable.css";

const ArtistPage = () => {
    const [searchParams] = useSearchParams();
    // /artist?id=<id> is exact (used by links from the Release page, which
    // has a real artist id). /artist?name=<name> is a fallback for links
    // from the catalog, which only has an artist's name — resolved to an id
    // via an artist search before the rest of the page can load.
    const idParam = searchParams.get("id");
    const nameParam = searchParams.get("name");
    const hasArtistParam = Boolean(idParam || nameParam);
    const page = Number(searchParams.get("page")) || 1;

    const [artist, setArtist] = useState<ArtistProfile | null>(null);
    const [releases, setReleases] = useState<ArtistRelease[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!hasArtistParam) return;

        const fetchArtist = async () => {
            setLoading(true);
            setError(null);
            try {
                const resolvedId = idParam ? Number(idParam) : await findArtistIdByName(nameParam as string);
                const [artistData, releasesData] = await Promise.all([
                    getArtist(resolvedId),
                    getArtistReleases(resolvedId, page),
                ]);
                setArtist(artistData);
                setReleases(releasesData.releases);
                setTotalPages(releasesData.pagination.pages);
            } catch (err) {
                console.error(err);
                setError(getApiErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };

        fetchArtist();
    }, [idParam, nameParam, page, hasArtistParam]);

    if (!hasArtistParam) return <p>No artist specified.</p>;
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!artist) return null;

    return (
        <div>
            <h2>{artist.name}</h2>
            {artist.profile && <p>{artist.profile}</p>}
            <h3>Releases</h3>
            {releases.length === 0 ? (
                <p>No releases found.</p>
            ) : (
                <table className="browse-catalog-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Year</th>
                        </tr>
                    </thead>
                    <tbody>
                        {releases.map((release) => (
                            <tr key={release.id}>
                                <td>
                                    <Link to={`/release/${release.id}`}>{release.title}</Link>
                                </td>
                                <td>{release.year}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <Pagination currentPage={page} totalPages={totalPages} basePath="/artist" />
        </div>
    );
};

export default ArtistPage;
