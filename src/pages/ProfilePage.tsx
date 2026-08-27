import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Alert, Button, Card, Col, Container, Image, Row } from "react-bootstrap";
import { discogsUserService } from "../services/discogsUserService";
import { getCached, setCached } from "../services/discogsUserCache";
import { useDiscogsConnection } from "../hooks/useDiscogsConnection";
import { useAuth } from "../contexts/AuthContext";
import ConnectDiscogsButton from "../components/ConnectDiscogsButton";
import MediaCard from "../components/MediaCard";
import ProfilePageSkeleton from "../components/skeletons/ProfilePageSkeleton";
import type { DiscogsUserProfile, CollectionRelease, DiscogsListDetail, WantlistItem } from "../types/discogsUser";
import { mockProfiles } from "../tests/mockProfiles";

export default function ProfilePage() {
    const { username } = useParams<{ username: string }>();
    const { user } = useAuth();
    const { connection } = useDiscogsConnection();
    const navigate = useNavigate();

    const handleArtistClick = (e: React.MouseEvent, artistName: string) => {
        // Stop the click from bubbling up to the surrounding card, which
        // navigates to the release instead.
        e.stopPropagation();
        navigate(`/artist?name=${encodeURIComponent(artistName)}`);
    };

    // "/profile" guesses that the app username matches a real Discogs
    // username when no account is linked yet. If that guess is wrong, the
    // lookup 404s — don't leave the user stuck on a dead-end error with no
    // way to link their real account.
    const isOwnUnlinkedGuess = !connection && !!user && user.username === username;
    // Whether this is the logged-in user's own profile (either their
    // unconnected app username, or their linked Discogs username).
    const isOwnProfile = !!user && (username === user.username || username === connection?.discogsUsername);

    // Mock profiles (used for demoing rated-releases lists) can stand in for
    // a real user's profile — but never for the logged-in user's own
    // profile, so a real account's real data is never hidden behind mock data.
    const mockProfile = !isOwnProfile ? mockProfiles.find((p) => p.username === username) : undefined;

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
                // Mock profiles don't correspond to real Discogs accounts, so
                // a 404 here is expected — synthesize a profile from the mock
                // data instead of dead-ending on an error page.
                if (mockProfile && axios.isAxiosError(err) && err.response?.status === 404) {
                    const ratingSum = mockProfile.ratedReleases.reduce((sum, r) => sum + r.rating, 0);
                    const syntheticProfile: DiscogsUserProfile = {
                        username: mockProfile.username,
                        profile: "",
                        avatar_url: mockProfile.avatarUrl,
                        num_collection: mockProfile.ratedReleases.length,
                        num_wantlist: 0,
                        num_lists: 1,
                        releases_rated: mockProfile.ratedReleases.length,
                        rating_avg: mockProfile.ratedReleases.length ? ratingSum / mockProfile.ratedReleases.length : 0,
                    };
                    setProfile(syntheticProfile);
                } else if (axios.isAxiosError(err)) {
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
    }, [username, connection, mockProfile]);

    // The Collection section uses the mock profile's rated releases in place
    // of a real Discogs collection (see the mockProfile lookup above).
    const mockCollection: CollectionRelease[] | null = mockProfile
        ? mockProfile.ratedReleases.map((release) => ({
              id: release.id,
              instance_id: release.id,
              rating: release.rating,
              date_added: new Date().toISOString(),
              basic_information: {
                  id: release.id,
                  title: release.title,
                  thumb: release.thumb,
                  artists: [{ name: release.artist }],
              },
          }))
        : null;
    const displayCollection = mockCollection ?? collection;
    const displayCollectionError = mockCollection ? null : collectionError;

    // Discogs doesn't expose a "date rated" — date_added (when the release
    // was added to the collection) is the closest proxy available.
    const recentlyRated = useMemo(
        () =>
            displayCollection
                .filter((item) => item.rating > 0)
                .sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime()),
        [displayCollection]
    );
    const visibleRecentlyRated = recentlyRated.slice(0, SECTION_PAGE_SIZE);
    const visibleCollection = displayCollection.slice(0, SECTION_PAGE_SIZE);
    const visibleWantlist = wantlist.slice(0, SECTION_PAGE_SIZE);

    if (loading) return (
        <Container fluid="lg" className="py-4">
            <ProfilePageSkeleton />
        </Container>
    );
    if (error && isOwnUnlinkedGuess) return (
        <Container fluid="lg" className="py-4">
            <section className="text-center mb-3">
                <h1>{user?.username}</h1>
                <p className="text-muted mb-0">Logged in as {user?.username}</p>
            </section>
            <Alert variant="warning" role="alert">
                We couldn't find a Discogs account matching your username ("{username}"). Connect your real
                Discogs account below to load your profile.
            </Alert>
            <div className="text-center">
                <ConnectDiscogsButton />
            </div>
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
                {isOwnProfile && connection && (
                    <p className="text-muted mb-0">Logged in as {user?.username}</p>
                )}
                {profile.location && <p>{profile.location}</p>}
                <p>
                    {profile.num_collection} in collection · {profile.releases_rated} rated
                    {profile.releases_rated > 0 && ` (avg ${profile.rating_avg.toFixed(1)})`}
                </p>
                {isOwnProfile && <ConnectDiscogsButton />}
            </section>

            {!displayCollectionError && recentlyRated.length > 0 && (
                <section className="mb-4">
                    <h2>Recently Rated</h2>
                    <Row xs={2} sm={3} md={4} lg={5} className="g-3">
                        {visibleRecentlyRated.map((item) => (
                            <Col key={item.instance_id}>
                                <MediaCard
                                    thumb={item.basic_information.thumb}
                                    alt={item.basic_information.title}
                                    title={item.basic_information.title}
                                    onClick={() => navigate(`/release/${item.basic_information.id}`)}
                                >
                                    {item.basic_information.artists?.[0] && (
                                        <Button
                                            variant="link"
                                            className="p-0 text-start d-block mb-1 media-card-subtitle"
                                            onClick={(e) => handleArtistClick(e, item.basic_information.artists![0].name)}
                                        >
                                            {item.basic_information.artists[0].name}
                                        </Button>
                                    )}
                                    <div>
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <span key={n} aria-hidden="true">
                                                {item.rating >= n ? "★" : "☆"}
                                            </span>
                                        ))}
                                    </div>
                                </MediaCard>
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
                {displayCollectionError ? (
                    <Alert variant="warning" role="alert">{displayCollectionError}</Alert>
                ) : displayCollection.length === 0 ? (
                    <p>This user hasn't added any releases to their collection yet.</p>
                ) : (
                    <>
                        <Row xs={2} sm={3} md={4} lg={5} className="g-3">
                            {visibleCollection.map((item) => (
                                <Col key={item.instance_id}>
                                    <MediaCard
                                        thumb={item.basic_information.thumb}
                                        alt={item.basic_information.title}
                                        title={item.basic_information.title}
                                        onClick={() => navigate(`/release/${item.basic_information.id}`)}
                                    >
                                        {item.basic_information.artists?.[0] && (
                                            <Button
                                                variant="link"
                                                className="p-0 text-start d-block mb-1 media-card-subtitle"
                                                onClick={(e) => handleArtistClick(e, item.basic_information.artists![0].name)}
                                            >
                                                {item.basic_information.artists[0].name}
                                            </Button>
                                        )}
                                        <div>
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <span key={n} aria-hidden="true">
                                                    {item.rating >= n ? "★" : "☆"}
                                                </span>
                                            ))}
                                            {item.rating === 0 && <span> Not rated</span>}
                                        </div>
                                    </MediaCard>
                                </Col>
                            ))}
                        </Row>
                        {displayCollection.length > SECTION_PAGE_SIZE && (
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
                                    <MediaCard
                                        thumb={item.basic_information.thumb}
                                        alt={item.basic_information.title}
                                        title={item.basic_information.title}
                                        onClick={() => navigate(`/release/${item.basic_information.id}`)}
                                    >
                                        {item.basic_information.artists?.[0] && (
                                            <Button
                                                variant="link"
                                                className="p-0 text-start d-block mb-1 media-card-subtitle"
                                                onClick={(e) => handleArtistClick(e, item.basic_information.artists![0].name)}
                                            >
                                                {item.basic_information.artists[0].name}
                                            </Button>
                                        )}
                                    </MediaCard>
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
