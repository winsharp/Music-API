import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { discogsAuthStorage } from "../services/discogsAuthStorage";
import { discogsOAuthService } from "../services/discogsOAuthService";

export default function DiscogsCallbackPage() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    // Guards against React StrictMode / re-renders completing the handshake twice.
    const startedRef = useRef(false);

    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;

        const oauthToken = searchParams.get("oauth_token");
        const oauthVerifier = searchParams.get("oauth_verifier");
        const pending = discogsAuthStorage.takePendingRequestToken();

        async function completeHandshake() {
            if (!user) {
                setError("You must be logged in to connect a Discogs account.");
                return;
            }
            if (!oauthToken || !oauthVerifier || !pending || pending.oauthToken !== oauthToken) {
                setError("This Discogs connection link is invalid or has expired. Please try connecting again.");
                return;
            }

            try {
                const accessToken = await discogsOAuthService.getAccessToken(
                    pending.oauthToken,
                    pending.oauthTokenSecret,
                    oauthVerifier
                );
                const identity = await discogsOAuthService.getIdentity(
                    accessToken.oauthToken,
                    accessToken.oauthTokenSecret
                );

                discogsAuthStorage.saveConnection(user.id, {
                    discogsUsername: identity.username,
                    oauthToken: accessToken.oauthToken,
                    oauthTokenSecret: accessToken.oauthTokenSecret,
                });

                navigate(`/profile/${identity.username}`, { replace: true });
            } catch {
                setError("Couldn't finish connecting your Discogs account. Please try again.");
            }
        }

        completeHandshake();
    }, [searchParams, user, navigate]);

    if (error) return <p role="alert">{error}</p>;
    return <p>Connecting your Discogs account...</p>;
}
