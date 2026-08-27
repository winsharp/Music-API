import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Alert, Card, Col, Container, Row } from "react-bootstrap";
import { discogsUserService } from "../services/discogsUserService";
import { getCached, setCached } from "../services/discogsUserCache";
import { useDiscogsConnection } from "../hooks/useDiscogsConnection";
import CardGridSkeleton from "../components/skeletons/CardGridSkeleton";
import type { CollectionRelease, WantlistItem } from "../types/discogsUser";
import "../styles/mediaThumb.css";

type Section = "rated" | "collection" | "wantlist";

const SECTION_TITLES: Record<Section, string> = {
    rated: "Recently Rated",
    collection: "Collection",
    wantlist: "Wantlist",
};

type SectionItem = (CollectionRelease | WantlistItem) & { key: number };

export default function ProfileSectionPage() {
    const { username, section } = useParams<{ username: string; section: Section }>();
    const { connection } = useDiscogsConnection();

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

        const fetchItems = async () => {
            const cached = getCached<CollectionRelease[] | WantlistItem[]>(cacheKey);
            setLoading(!cached);
            setError(null);
            try {
                if (section === "wantlist") {
                    const wants = (cached as WantlistItem[] | undefined) ?? (await discogsUserService.getWantlist(username, connection)).wants;
                    if (!cached) setCached(cacheKey, wants);
                    setItems(wants.map((item) => ({ ...item, key: item.id })));
                } else {
                    const releases =
                        (cached as CollectionRelease[] | undefined) ??
                        (await discogsUserService.getCollection(username, connection)).releases;
                    if (!cached) setCached(cacheKey, releases);
                    const filtered =
                        section === "rated"
                            ? releases
                                  .filter((item) => item.rating > 0)
                                  .sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime())
                            : releases;
                    setItems(filtered.map((item) => ({ ...item, key: item.instance_id })));
                }
            } catch (err) {
                if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
                    setError(`${username}'s ${SECTION_TITLES[section].toLowerCase()} is private.`);
                } else {
                    setError(`Couldn't load this user's ${SECTION_TITLES[section].toLowerCase()} right now.`);
                }
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [username, section, connection]);

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
                <Row xs={2} sm={3} md={4} lg={5} className="g-3">
                    {items.map((item) => (
                        <Col key={item.key}>
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
                                    {showRating && (
                                        <div>
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <span key={n} aria-hidden="true">
                                                    {item.rating >= n ? "★" : "☆"}
                                                </span>
                                            ))}
                                            {section === "collection" && item.rating === 0 && <span> Not rated</span>}
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
}
