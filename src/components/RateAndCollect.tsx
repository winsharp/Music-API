import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { discogsAuthStorage } from "../services/discogsAuthStorage";
import { releaseCollectionService } from "../services/releaseCollectionService";

interface RateAndCollectProps {
    releaseId: number;
    existingEntry?: { instance_id: number; rating: number };
}

const RateAndCollect = ({ releaseId, existingEntry }: RateAndCollectProps) => {
    const { user } = useAuth();
    const [instanceId, setInstanceId] = useState<number | null>(existingEntry?.instance_id ?? null);
    const [rating, setRating] = useState(existingEntry?.rating ?? 0);
    const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

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

    if (!user) return null;
    if (!connection) return <p>Connect your Discogs account to rate and save releases.</p>;

    return (
        <div>
            {!instanceId ? (
                <button type="button" onClick={handleAddToCollection} disabled={status === "saving"}>
                    {status === "saving" ? "Saving..." : "Save to Collection"}
                </button>
            ) : (
                <div>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button
                            type="button"
                            key={n}
                            onClick={() => handleRate(n)}
                            disabled={status === "saving"}
                        >
                            {rating >= n ? "★" : "☆"}
                        </button>
                    ))}
                </div>
            )}
            {status === "error" && <p>Something went wrong. Please try again.</p>}
        </div>
    );
};

export default RateAndCollect;