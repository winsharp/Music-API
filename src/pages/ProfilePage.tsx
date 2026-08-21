import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { discogsUserService } from "../services/discogsUserService";
import { useDiscogsConnection } from "../hooks/useDiscogsConnection";
import ConnectDiscogsButton from "../components/ConnectDiscogsButton";
import type { DiscogsUserProfile, CollectionRelease, DiscogsListDetail, WantlistItem } from "../types/discogsUser";

export default function ProfilePage() {
    const { username } = useParams<{ username: string }>();
    const { connection } = useDiscogsConnection();

    const [profile, setProfile] = useState<DiscogsUserProfile | null>(null);
    const [collection, setCollection] = useState<CollectionRelease[]>([]);
    // A personal access token authenticates as our own account, so it can
    // only read another user's "All" folder if that user's collection is
    // public. Most users' collections are private, so this is expected.
    const [collectionError, setCollectionError] = useState<string | null>(null);
    // User-created lists (separate from Collection/Wantlist). Private lists
    // only come back when authenticated as the owner.
    const [lists, setLists] = useState<DiscogsListDetail[]>([]);
    const [listsError, setListsError] = useState<string | null>(null);
    // Releases wanted but not owned. Private wantlists only come back when
    // authenticated as the owner.
    const [wantlist, setWantlist] = useState<WantlistItem[]>([]);
    const [wantlistError, setWantlistError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!username) return;

        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            setCollectionError(null);
            setListsError(null);
            setWantlistError(null);
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
            }

            try {
                const listsData = await discogsUserService.getLists(username, connection);
                const details = await Promise.all(
                    listsData.lists.map((list) => discogsUserService.getListDetail(list.id, connection))
                );
                setLists(details);
            } catch (err) {
                if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
                    setListsError(`${username}'s lists are private.`);
                } else {
                    setListsError("Couldn't load this user's lists right now.");
                }
                setLists([]);
            }

            try {
                const wantlistData = await discogsUserService.getWantlist(username, connection);
                setWantlist(wantlistData.wants);
            } catch (err) {
                if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
                    setWantlistError(`${username}'s wantlist is private.`);
                } else {
                    setWantlistError("Couldn't load this user's wantlist right now.");
                }
                setWantlist([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username, connection]);

    // Discogs doesn't expose a "date rated" — date_added (when the release
    // was added to the collection) is the closest proxy available.
    const recentlyRated = useMemo(
        () =>
            collection
                .filter((item) => item.rating > 0)
                .sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime())
                .slice(0, 10),
        [collection]
    );

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

            {!collectionError && recentlyRated.length > 0 && (
                <section>
                    <h2>Recently Rated</h2>
                    <div>
                        {recentlyRated.map((item) => (
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
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

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

            <section>
                <h2>Lists</h2>
                {listsError ? (
                    <p role="alert">{listsError}</p>
                ) : lists.length === 0 ? (
                    <p>This user hasn't created any lists yet.</p>
                ) : (
                    <div>
                        {lists.map((list) => (
                            <div key={list.id}>
                                <h3>{list.name}</h3>
                                {list.description && <p>{list.description}</p>}
                                {list.items.length === 0 ? (
                                    <p>This list is empty.</p>
                                ) : (
                                    <ul>
                                        {list.items.map((item) => (
                                            <li key={item.id}>{item.display_title}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2>Wantlist</h2>
                {wantlistError ? (
                    <p role="alert">{wantlistError}</p>
                ) : wantlist.length === 0 ? (
                    <p>This user hasn't added anything to their wantlist yet.</p>
                ) : (
                    <div>
                        {wantlist.map((item) => (
                            <div key={item.id}>
                                {item.basic_information.thumb && (
                                    <img src={item.basic_information.thumb} alt={item.basic_information.title} />
                                )}
                                <p>{item.basic_information.title}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
