import { useState } from "react";
import { Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { discogsAuthStorage } from "../services/discogsAuthStorage";
import { releaseCollectionService } from "../services/releaseCollectionService";
import { wantlistService } from "../services/wantlistService";

interface RateAndCollectProps {
    releaseId: number;
    existingEntry?: { instance_id: number; rating: number };
    inWantlist?: boolean;
}

const RateAndCollect = ({ releaseId, existingEntry, inWantlist }: RateAndCollectProps) => {
    const { user } = useAuth();
    const location = useLocation();
    const [instanceId, setInstanceId] = useState<number | null>(existingEntry?.instance_id ?? null);
    const [rating, setRating] = useState(existingEntry?.rating ?? 0);
    const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [wanted, setWanted] = useState(inWantlist ?? false);
    const [wantlistStatus, setWantlistStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

    const connection = user ? discogsAuthStorage.getConnection(user.id) : null;

    const handleAddToCollection = async () => {
        if (!connection) return;
        setStatus("saving");
        try {
            const result = await releaseCollectionService.addToCollection(connection, releaseId);
            setInstanceId(result.instance_id);
            setStatus("saved");
        } catch {
            setStatus("error");
        }
    };

    const handleRate = async (newRating: number) => {
        if (!connection || !instanceId) return;
        setRating(newRating);
        setStatus("saving");
        try {
            await releaseCollectionService.rateRelease(connection, releaseId, instanceId, newRating);
            setStatus("saved");
        } catch {
            setStatus("error");
        }
    };

    const handleToggleWantlist = async () => {
        if (!connection) return;
        setWantlistStatus("saving");
        try {
            if (wanted) {
                await wantlistService.removeFromWantlist(connection, releaseId);
                setWanted(false);
            } else {
                await wantlistService.addToWantlist(connection, releaseId);
                setWanted(true);
            }
            setWantlistStatus("saved");
        } catch {
            setWantlistStatus("error");
        }
    };

    if (!user) {
        return (
            <p className="mb-0 small">
                <Link to="/login" state={{ from: location }}>Log in</Link> to rate, collect, and save releases to your wantlist.
            </p>
        );
    }
    if (!connection) return <p className="mb-0 small">Connect your Discogs account to rate and save releases.</p>;

    return (
        <div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
                {!instanceId ? (
                    <Button variant="primary" size="sm" onClick={handleAddToCollection} disabled={status === "saving"}>
                        {status === "saving" ? "Saving..." : "Save to Collection"}
                    </Button>
                ) : (
                    <div className="d-flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                type="button"
                                key={n}
                                className="btn btn-link p-0 border-0 fs-5 lh-1"
                                onClick={() => handleRate(n)}
                                disabled={status === "saving"}
                            >
                                {rating >= n ? "★" : "☆"}
                            </button>
                        ))}
                    </div>
                )}
                <Button
                    variant={wanted ? "secondary" : "outline-secondary"}
                    size="sm"
                    onClick={handleToggleWantlist}
                    disabled={wantlistStatus === "saving"}
                >
                    {wantlistStatus === "saving" ? "Saving..." : wanted ? "Remove from Wantlist" : "Add to Wantlist"}
                </Button>
            </div>
            {status === "error" && <p className="text-danger small mb-0">Something went wrong. Please try again.</p>}
            {wantlistStatus === "error" && <p className="text-danger small mb-0">Something went wrong updating your wantlist. Please try again.</p>}
        </div>
    );
};

export default RateAndCollect;
