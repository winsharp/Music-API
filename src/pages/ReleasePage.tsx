import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert, Badge, Card, Col, Container, Image, ListGroup, Row } from "react-bootstrap";
import { getRelease } from "../services/releaseService";
import { releaseCollectionService } from "../services/releaseCollectionService";
import { discogsUserService } from "../services/discogsUserService";
import { useAuth } from "../contexts/AuthContext";
import { discogsAuthStorage } from "../services/discogsAuthStorage";
import type { ReleaseDetail } from "../types/release";
import ReleaseDetailSkeleton from "../components/skeletons/ReleaseDetailSkeleton";
import RateAndCollect from "../components/RateAndCollect";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import "../styles/mediaThumb.css";

const ReleasePage = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const connection = user ? discogsAuthStorage.getConnection(user.id) : null;

    const [release, setRelease] = useState<ReleaseDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [existingEntry, setExistingEntry] = useState<{ instance_id: number; rating: number } | undefined>(undefined);
    const [inWantlist, setInWantlist] = useState(false);

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

    // Pre-fill collection/wantlist status for this release so the buttons
    // reflect reality instead of always starting from scratch. Fails quietly
    // — the user can still use the buttons even if this lookup fails.
    useEffect(() => {
        if (!id || !connection) return;
        const releaseId = Number(id);

        const fetchStatus = async () => {
            try {
                const entry = await releaseCollectionService.findExistingEntry(connection, releaseId);
                setExistingEntry(entry ?? undefined);
            } catch {
                // fail quietly
            }
            try {
                const wantlist = await discogsUserService.getWantlist(connection.discogsUsername, connection);
                setInWantlist(wantlist.wants.some((want) => want.basic_information.id === releaseId));
            } catch {
                // fail quietly
            }
        };

        void fetchStatus();
    }, [id, connection]);

    if (loading) return (
        <Container fluid="lg" className="py-4">
            <ReleaseDetailSkeleton />
        </Container>
    );
    if (error) return (
        <Container fluid="lg" className="py-4">
            <Alert variant="danger">{error}</Alert>
        </Container>
    );
    if (!release) return null;

    // Discogs tracklists can include non-song rows (LP side headings, disc
    // index entries) alongside real tracks — only "track" rows are songs.
    const tracks = (release.tracklist || []).filter((track) => track.type_ === "track");

    return (
        <Container fluid="lg" className="py-4">
            <Card className="p-3 p-md-4 mb-4">
                <Row className="g-4 align-items-center">
                    <Col xs={5} sm={4} md={3} className="mx-auto mx-sm-0">
                        {release.thumb ? (
                            <Image src={release.thumb} alt={release.title} className="media-thumb rounded" />
                        ) : (
                            <div className="media-thumb media-thumb-placeholder rounded d-flex align-items-center justify-content-center">
                                <span className="text-muted small">No image available</span>
                            </div>
                        )}
                    </Col>
                    <Col xs={12} sm={8} md={9}>
                        <h2 className="mb-1">{release.title}</h2>
                        {release.artists && release.artists.length > 0 && (
                            <p className="mb-2 fs-5">
                                {release.artists.map((artist, index) => (
                                    <span key={artist.id}>
                                        {index > 0 && ", "}
                                        <Link to={`/artist?id=${artist.id}`}>{artist.name}</Link>
                                    </span>
                                ))}
                            </p>
                        )}
                        <p className="text-muted mb-3">{release.year ?? "Unknown year"}</p>
                        {((release.genres && release.genres.length > 0) || (release.styles && release.styles.length > 0)) && (
                            <div className="d-flex flex-wrap gap-2 mb-3">
                                {release.genres?.map((genre) => (
                                    <Badge key={genre} bg="secondary">{genre}</Badge>
                                ))}
                                {release.styles?.map((style) => (
                                    <Badge key={style} bg="dark">{style}</Badge>
                                ))}
                            </div>
                        )}
                        <div className="pt-2 border-top">
                            <RateAndCollect releaseId={release.id} existingEntry={existingEntry} inWantlist={inWantlist} />
                        </div>
                    </Col>
                </Row>
            </Card>
            <Card className="p-3 p-md-4">
                <h3>Tracklist</h3>
                {tracks.length === 0 ? (
                    <p>No tracklist available.</p>
                ) : (
                    <ListGroup as="ol" numbered className="mx-auto" style={{ maxWidth: 600 }}>
                        {tracks.map((track, index) => (
                            <ListGroup.Item as="li" key={`${track.position}-${index}`} className="text-start">
                                {track.title}
                                {track.duration ? ` (${track.duration})` : ""}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Card>
        </Container>
    );
};

export default ReleasePage;
