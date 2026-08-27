import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Alert, Card, Col, Container, Image, Row } from "react-bootstrap";
import { discogsUserService } from "../services/discogsUserService";
import { getCached, setCached } from "../services/discogsUserCache";
import { useDiscogsConnection } from "../hooks/useDiscogsConnection";
import ConnectDiscogsButton from "../components/ConnectDiscogsButton";
import ProfilePageSkeleton from "../components/skeletons/ProfilePageSkeleton";
import type { DiscogsUserProfile, CollectionRelease, DiscogsListDetail, WantlistItem } from "../types/discogsUser";
import "../styles/mediaThumb.css";

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

    // Each section only shows a handful of items; clicking "View All" takes
    // the user to a dedicated page with the full list.
    const SECTION_PAGE_SIZE = 5;

    useEffect(() => {
        if (!username) return;

        // Reuse recently-fetched data (e.g. when navigating back from a
        // "View All" section page) instead of showing a full-page loading
        // state and re-hitting Discogs for data we already have.
        const connKey = connection?.discogsUsername ?? "anon";
        const profileKey = `profile:${username}`;
        const collectionKey = `collection:${username}:${connKey}`;
        const listsKey = `lists:${username}:${connKey}`;
        const wantlistKey = `wantlist:${username}:${connKey}`;

        const cachedProfile = getCached<DiscogsUserProfile>(profileKey);
        const cachedCollection = getCached<CollectionRelease[]>(collectionKey);
        const cachedLists = getCached<DiscogsListDetail[]>(listsKey);
        const cachedWantlist = getCached<WantlistItem[]>(wantlistKey);

        if (cachedProfile) setProfile(cachedProfile);
        if (cachedCollection) setCollection(cachedCollection);
        if (cachedLists) setLists(cachedLists);
        if (cachedWantlist) setWantlist(cachedWantlist);

        const fetchProfile = async () => {
            setLoading(!cachedProfile);
            setError(null);
            setCollectionError(null);
            setListsError(null);
            setWantlistError(null);
            try {
                const profileData = cachedProfile ?? (await discogsUserService.getProfile(username));
                if (!cachedProfile) setCached(profileKey, profileData);
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
                const releases = cachedCollection ?? (await discogsUserService.getCollection(username, connection)).releases;
                if (!cachedCollection) setCached(collectionKey, releases);
                setCollection(releases);
            } catch (err) {
                if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
                    setCollectionError(`${username}'s collection is private.`);
                } else {
                    setCollectionError("Couldn't load this user's collection right now.");
                }
                setCollection([]);
            }

            try {
                let details = cachedLists;
                if (!details) {
                    const listsData = await discogsUserService.getLists(username, connection);
                    details = await Promise.all(
                        listsData.lists.map((list) => discogsUserService.getListDetail(list.id, connection))
                    );
                    setCached(listsKey, details);
                }
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
                const wants = cachedWantlist ?? (await discogsUserService.getWantlist(username, connection)).wants;
                if (!cachedWantlist) setCached(wantlistKey, wants);
                setWantlist(wants);
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
                .sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime()),
        [collection]
    );
    const visibleRecentlyRated = recentlyRated.slice(0, SECTION_PAGE_SIZE);
    const visibleCollection = collection.slice(0, SECTION_PAGE_SIZE);
    const visibleWantlist = wantlist.slice(0, SECTION_PAGE_SIZE);

    if (loading) return (
        <Container fluid="lg" className="py-4">
            <ProfilePageSkeleton />
        </Container>
    );
    if (error) return (
        <Container fluid="lg" className="py-4">
            <Alert variant="danger" role="alert">{error}</Alert>
        </Container>
    );
    if (!profile) return null;

    return (
        <Container fluid="lg" className="py-4">
            <section className="text-center mb-4">
                {profile.avatar_url && (
                    <Image src={profile.avatar_url} alt={profile.username} roundedCircle width={96} height={96} className="mb-2" />
                )}
                <h1>{profile.username}</h1>
                {profile.location && <p>{profile.location}</p>}
                <p>
                    {profile.num_collection} in collection · {profile.releases_rated} rated
                    {profile.releases_rated > 0 && ` (avg ${profile.rating_avg.toFixed(1)})`}
                </p>
                <ConnectDiscogsButton />
            </section>

            {!collectionError && recentlyRated.length > 0 && (
                <section className="mb-4">
                    <h2>Recently Rated</h2>
                    <Row xs={2} sm={3} md={4} lg={5} className="g-3">
                        {visibleRecentlyRated.map((item) => (
                            <Col key={item.instance_id}>
                                <Card className="h-100">
                                    {item.basic_information.thumb ? (
                                        <Card.Img
                                            variant="top"
                                            className="media-thumb"
                                            src={item.basic_information.thumb}
                                            alt={item.basic_information.title}
                                        />
                                    ) : (
                                        <div className="media-thumb media-thumb-placeholder" />
                                    )}
                                    <Card.Body className="p-2">
                                        <p className="mb-1 small">{item.basic_information.title}</p>
                                        <div>
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <span key={n} aria-hidden="true">
                                                    {item.rating >= n ? "★" : "☆"}
                                                </span>
                                            ))}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    {recentlyRated.length > SECTION_PAGE_SIZE && (
                        <div className="text-center mt-2">
                            <Link to={`/profile/${username}/rated`} className="btn btn-link btn-sm p-0 text-decoration-none">
                                View All
                            </Link>
                        </div>
                    )}
                </section>
            )}

            <section className="mb-4">
                <h2>Collection</h2>
                {collectionError ? (
                    <Alert variant="warning" role="alert">{collectionError}</Alert>
                ) : collection.length === 0 ? (
                    <p>This user hasn't added any releases to their collection yet.</p>
                ) : (
                    <>
                        <Row xs={2} sm={3} md={4} lg={5} className="g-3">
                            {visibleCollection.map((item) => (
                                <Col key={item.instance_id}>
                                    <Card className="h-100">
                                        {item.basic_information.thumb ? (
                                            <Card.Img
                                                variant="top"
                                                className="media-thumb"
                                                src={item.basic_information.thumb}
                                                alt={item.basic_information.title}
                                            />
                                        ) : (
                                            <div className="media-thumb media-thumb-placeholder" />
                                        )}
                                        <Card.Body className="p-2">
                                            <p className="mb-1 small">{item.basic_information.title}</p>
                                            <div>
                                                {[1, 2, 3, 4, 5].map((n) => (
                                                    <span key={n} aria-hidden="true">
                                                        {item.rating >= n ? "★" : "☆"}
                                                    </span>
                                                ))}
                                                {item.rating === 0 && <span> Not rated</span>}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        {collection.length > SECTION_PAGE_SIZE && (
                            <div className="text-center mt-2">
                                <Link
                                    to={`/profile/${username}/collection`}
                                    className="btn btn-link btn-sm p-0 text-decoration-none"
                                >
                                    View All
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </section>

            <section className="mb-4">
                <h2>Lists</h2>
                {listsError ? (
                    <Alert variant="warning" role="alert">{listsError}</Alert>
                ) : lists.length === 0 ? (
                    <p>This user hasn't created any lists yet.</p>
                ) : (
                    <Row xs={1} md={2} className="g-3">
                        {lists.map((list) => (
                            <Col key={list.id}>
                                <Card className="h-100">
                                    <Card.Body>
                                        <Card.Title as="h3" className="h5">{list.name}</Card.Title>
                                        {list.description && <Card.Text>{list.description}</Card.Text>}
                                        {list.items.length === 0 ? (
                                            <p className="mb-0">This list is empty.</p>
                                        ) : (
                                            <ul className="mb-0">
                                                {list.items.map((item) => (
                                                    <li key={item.id}>{item.display_title}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </section>

            <section>
                <h2>Wantlist</h2>
                {wantlistError ? (
                    <Alert variant="warning" role="alert">{wantlistError}</Alert>
                ) : wantlist.length === 0 ? (
                    <p>This user hasn't added anything to their wantlist yet.</p>
                ) : (
                    <>
                        <Row xs={2} sm={3} md={4} lg={5} className="g-3">
                            {visibleWantlist.map((item) => (
                                <Col key={item.id}>
                                    <Card className="h-100">
                                        {item.basic_information.thumb ? (
                                            <Card.Img
                                                variant="top"
                                                className="media-thumb"
                                                src={item.basic_information.thumb}
                                                alt={item.basic_information.title}
                                            />
                                        ) : (
                                            <div className="media-thumb media-thumb-placeholder" />
                                        )}
                                        <Card.Body className="p-2">
                                            <p className="mb-0 small">{item.basic_information.title}</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        {wantlist.length > SECTION_PAGE_SIZE && (
                            <div className="text-center mt-2">
                                <Link
                                    to={`/profile/${username}/wantlist`}
                                    className="btn btn-link btn-sm p-0 text-decoration-none"
                                >
                                    View All
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </section>
        </Container>
    );
}
