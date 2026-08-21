import { useCallback, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { discogsAuthStorage } from "../services/discogsAuthStorage";
import { discogsOAuthService } from "../services/discogsOAuthService";
import type { DiscogsConnection } from "../types/discogsOAuth";

export function useDiscogsConnection() {
    const { user } = useAuth();
    const [connection, setConnection] = useState<DiscogsConnection | null>(() =>
        user ? discogsAuthStorage.getConnection(user.id) : null
    );
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connect = useCallback(async () => {
        if (!user) return;
        setConnecting(true);
        setError(null);
        try {
            const callbackUrl = `${window.location.origin}/discogs/callback`;
            const requestToken = await discogsOAuthService.getRequestToken(callbackUrl);
            discogsAuthStorage.savePendingRequestToken(requestToken);
            window.location.href = discogsOAuthService.getAuthorizeUrl(requestToken.oauthToken);
        } catch {
            setError("Couldn't start the Discogs connection. Please try again.");
            setConnecting(false);
        }
    }, [user]);

    const disconnect = useCallback(() => {
        if (!user) return;
        discogsAuthStorage.clearConnection(user.id);
        setConnection(null);
    }, [user]);

    return { connection, connecting, error, connect, disconnect };
}
