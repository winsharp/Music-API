import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Alert, Container } from "react-bootstrap";
import { discogsUserService } from "../services/discogsUserService";
import { getCached, setCached } from "../services/discogsUserCache";
import { useDiscogsConnection } from "../hooks/useDiscogsConnection";
import { useAuth } from "../hooks/useAuth";
import ReleaseGrid from "../components/ReleaseGrid";
import CardGridSkeleton from "../components/skeletons/CardGridSkeleton";
import type { CollectionRelease, WantlistItem } from "../types/discogsUser";
import { mockProfiles } from "../tests/mockProfiles";

type Section = "rated" | "collection" | "wantlist";

const SECTION_TITLES: Record<Section, string> = {
    rated: "Recently Rated",
    collection: "Collection",
    wantlist: "Wantlist",
};

type SectionItem = (CollectionRelease | WantlistItem) & { key: number };

export default function ProfileSectionPage() {
    const { username, section } = useParams<{ username: string; section: Section }>();
    const { user } = useAuth();
    const { connection } = useDiscogsConnection();

    // Same rule as ProfilePage: mock profiles can stand in for a real user's
    // profile, but never for the logged-in user's own profile.
    const isOwnProfile = !!user && (username === user.username || username === connection?.discogsUsername);
    const mockProfile = !isOwnProfile ? mockProfiles.find((p) => p.username === username) : undefined;

    const [items, setItems] = useState<SectionItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!username || !section) return;

        // Recently Rated and Collection both derive from the same
        // collection fetch, so they share a cache key with each other (and
        // with ProfilePage) to avoid re-fetching when navigating back and forth.
        const connKey = connection?.discogsUsername ?? "anon";
        const cacheKey =
            section === "wantlist" ? `wantlist:${username}:${connKey}` : `collection:${username}:${connKey}`;

        // Mock profiles don't correspond to real Discogs accounts, so their
        // collection/wantlist requests 404 — fall back to the mock's rated
        // releases instead of dead-ending with an error, mirroring ProfilePage.
        const mockCollection: CollectionRelease[] | undefined = mockProfile
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
            : undefined;

        const fetchItems = async () => {
            const cached = getCached<CollectionRelease[] | WantlistItem[]>(cacheKey);
            setLoading(!cached);
            setError(null);
            try {
                if (section === "wantlist") {
                    if (mockCollection) {
                        // Mock profiles don't have wantlist data.
                        setItems([]);
                        return;
                    }
                    const wants = (cached as WantlistItem[] | undefined) ?? (await discogsUserService.getWantlist(username, connection)).wants;
                    if (!cached) setCached(cacheKey, wants);
                    setItems(wants.map((item) => ({ ...item, key: item.id })));
                } else {
                    const releases =
                        (cached as CollectionRelease[] | undefined) ??
                        mockCollection ??
                        (await discogsUserService.getCollection(username, connection)).releases;
                    if (!cached && !mockCollection) setCached(cacheKey, releases);
                    const filtered =
                        section === "rated"
                            ? releases
                                  .filter((item) => item.rating > 0)
                                  .sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime())
                            : releases;
                    setItems(filtered.map((item) => ({ ...item, key: item.instance_id })));
                }
            } catch (err) {
                if (mockCollection) {
                    // Already handled via mockCollection above; getCollection
                    // shouldn't be reached for mock profiles, but guard anyway.
                    setItems([]);
                } else if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
                    setError(`${username}'s ${SECTION_TITLES[section].toLowerCase()} is private.`);
                } else {
                    setError(`Couldn't load this user's ${SECTION_TITLES[section].toLowerCase()} right now.`);
                }
                if (!mockCollection) setItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [username, section, connection, mockProfile]);

    const title = section ? SECTION_TITLES[section] : "";
    const showRating = section === "rated" || section === "collection";

    const emptyMessage = useMemo(() => {
        switch (section) {
            case "rated":
                return "This user hasn't rated anything yet.";
            case "collection":
                return "This user hasn't added any releases to their collection yet.";
            case "wantlist":
                return "This user hasn't added anything to their wantlist yet.";
            default:
                return "";
        }
    }, [section]);

    if (!username || !section) return null;

    return (
        <Container fluid="lg" className="py-4">
            <Link to={`/profile/${username}`}>&larr; Back to {username}'s profile</Link>
            <h1 className="mt-2 mb-4">{title}</h1>

            {loading ? (
                <CardGridSkeleton count={10} />
            ) : error ? (
                <Alert variant="warning" role="alert">{error}</Alert>
            ) : items.length === 0 ? (
                <p>{emptyMessage}</p>
            ) : (
                <ReleaseGrid items={items} getKey={(item) => item.key} showRating={showRating} />
            )}
        </Container>
    );
}
