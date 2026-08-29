import { useCallback, useState } from "react";
import { useAuth } from "./useAuth";
import { discogsAuthStorage } from "../services/discogsAuthStorage";
import { discogsOAuthService } from "../services/discogsOAuthService";
import type { DiscogsConnection } from "../types/discogsOAuth";

/**
 * Manages the logged-in user's Discogs OAuth connection: whether they're
 * currently connected (per-user, read from `discogsAuthStorage`), and the
 * `connect`/`disconnect` actions used by `ConnectDiscogsButton` and
 * `SettingsPage`.
 *
 * `connect()` kicks off the OAuth 1.0a flow by requesting a request token
 * from Discogs, stashing it as "pending" in storage, and redirecting the
 * browser to Discogs' authorize page; `DiscogsCallbackPage` completes the
 * flow when Discogs redirects back. `disconnect()` just clears local storage
 * (no Discogs-side revocation is performed).
 */
export function useDiscogsConnection() {
    const { user } = useAuth();
    const [connection, setConnection] = useState<DiscogsConnection | null>(() =>
        user ? discogsAuthStorage.getConnection(user.id) : null
    );
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /** Starts the Discogs OAuth flow by redirecting to Discogs' authorize page. */
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

    /** Removes the stored Discogs connection for the current user. */
    const disconnect = useCallback(() => {
        if (!user) return;
        discogsAuthStorage.clearConnection(user.id);
        setConnection(null);
    }, [user]);

    return { connection, connecting, error, connect, disconnect };
}
