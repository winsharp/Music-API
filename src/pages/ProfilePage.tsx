import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { discogsUserService } from "../services/discogsUserService";
import { useDiscogsConnection } from "../hooks/useDiscogsConnection";
import ConnectDiscogsButton from "../components/ConnectDiscogsButton";
import type { DiscogsUserProfile, CollectionRelease } from "../types/discogsUser";

export default function ProfilePage() {
    const { username } = useParams<{ username: string }>();
    const { connection } = useDiscogsConnection();

    const [profile, setProfile] = useState<DiscogsUserProfile | null>(null);
    const [collection, setCollection] = useState<CollectionRelease[]>([]);
    // A personal access token authenticates as our own account, so it can
    // only read another user's "All" folder if that user's collection is
    // public. Most users' collections are private, so this is expected.
    const [collectionError, setCollectionError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!username) return;

        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            setCollectionError(null);
            try {
                const profileData = await discogsUserService.getProfile(username);
                setProfile(profileData);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    if (!err.response) {
                        setError("Couldn't reach Discogs — check your internet connection and try again.");
                    } else if (err.response.status === 404) {
                        setError(`No Discogs user found for "${username}".`);
                    } else {
                        setError("Something went wrong fetching this profile. Please try again.");
                    }
                } else {
                    setError("Something went wrong fetching this profile. Please try again.");
                }
                setLoading(false);
                return;
            }

            try {
                const collectionData = await discogsUserService.getCollection(username, connection);
                setCollection(collectionData.releases);
            } catch (err) {
                if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
                    setCollectionError(`${username}'s collection is private.`);
                } else {
                    setCollectionError("Couldn't load this user's collection right now.");
                }
                setCollection([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username, connection]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p role="alert">{error}</p>;
    if (!profile) return null;

    return (
        <div>
            <section>
                {profile.avatar_url && <img src={profile.avatar_url} alt={profile.username} />}
                <h1>{profile.username}</h1>
                {profile.location && <p>{profile.location}</p>}
                <p>
                    {profile.num_collection} in collection · {profile.releases_rated} rated
                    {profile.releases_rated > 0 && ` (avg ${profile.rating_avg.toFixed(1)})`}
                </p>
                <ConnectDiscogsButton />
            </section>

            <section>
                <h2>Collection</h2>
                {collectionError ? (
                    <p role="alert">{collectionError}</p>
                ) : collection.length === 0 ? (
                    <p>This user hasn't added any releases to their collection yet.</p>
                ) : (
                    <div>
                        {collection.map((item) => (
                            <div key={item.instance_id}>
                                {item.basic_information.thumb && (
                                    <img src={item.basic_information.thumb} alt={item.basic_information.title} />
                                )}
                                <p>{item.basic_information.title}</p>
                                <div>
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <span key={n} aria-hidden="true">
                                            {item.rating >= n ? "★" : "☆"}
                                        </span>
                                    ))}
                                    {item.rating === 0 && <span> Not rated</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
