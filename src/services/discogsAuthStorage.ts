// Persists each app user's linked Discogs account (independent of the app's
// own login session — connecting/disconnecting Discogs never logs you out
// of the app, and vice versa).

import type { DiscogsConnection, RequestToken } from "../types/discogsOAuth";

const CONNECTION_KEY_PREFIX = "music-api:discogs-auth:";
// Only needed transiently between redirecting to Discogs and coming back.
const PENDING_REQUEST_TOKEN_KEY = "music-api:discogs-pending-request-token";

export const discogsAuthStorage = {
    getConnection(userId: string): DiscogsConnection | null {
        const raw = localStorage.getItem(CONNECTION_KEY_PREFIX + userId);
        if (!raw) return null;
        try {
            return JSON.parse(raw) as DiscogsConnection;
        } catch {
            return null;
        }
    },

    saveConnection(userId: string, connection: DiscogsConnection): void {
        localStorage.setItem(CONNECTION_KEY_PREFIX + userId, JSON.stringify(connection));
    },

    clearConnection(userId: string): void {
        localStorage.removeItem(CONNECTION_KEY_PREFIX + userId);
    },

    savePendingRequestToken(token: RequestToken): void {
        sessionStorage.setItem(PENDING_REQUEST_TOKEN_KEY, JSON.stringify(token));
    },

    takePendingRequestToken(): RequestToken | null {
        const raw = sessionStorage.getItem(PENDING_REQUEST_TOKEN_KEY);
        sessionStorage.removeItem(PENDING_REQUEST_TOKEN_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw) as RequestToken;
        } catch {
            return null;
        }
    },
};
