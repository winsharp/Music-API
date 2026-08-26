import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getRelease } from "../services/releaseService";
import type { ReleaseDetail } from "../types/release";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

const ReleasePage = () => {
    const { id } = useParams<{ id: string }>();

    const [release, setRelease] = useState<ReleaseDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchRelease = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getRelease(id);
                setRelease(data);
            } catch (err) {
                console.error(err);
                setError(getApiErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };

        fetchRelease();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!release) return null;

    // Discogs tracklists can include non-song rows (LP side headings, disc
    // index entries) alongside real tracks — only "track" rows are songs.
    const tracks = (release.tracklist || []).filter((track) => track.type_ === "track");

    return (
        <div>
            <h2>{release.title}</h2>
            {release.artists && release.artists.length > 0 && (
                <p>
                    By{" "}
                    {release.artists.map((artist, index) => (
                        <span key={artist.id}>
                            {index > 0 && ", "}
                            <Link to={`/artist?id=${artist.id}`}>{artist.name}</Link>
                        </span>
                    ))}
                </p>
            )}
            <p>Release Year: {release.year ?? "Unknown"}</p>
            <p>Genre: {release.genres && release.genres.length > 0 ? release.genres.join(", ") : "Unknown"}</p>
            <h3>Tracklist</h3>
            {tracks.length === 0 ? (
                <p>No tracklist available.</p>
            ) : (
                <ol>
                    {tracks.map((track, index) => (
                        <li key={`${track.position}-${index}`}>
                            {track.title}
                            {track.duration ? ` (${track.duration})` : ""}
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
};

export default ReleasePage;
