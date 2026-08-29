// Handles the Discogs OAuth 1.0a handshake entirely client-side.
//
// Discogs supports the "PLAINTEXT" oauth_signature_method, which is just
// `consumer_secret&token_secret` sent as-is over HTTPS — no HMAC-SHA1
// needed. See https://www.discogs.com/developers#page:authentication.
//
// Security note: this necessarily ships VITE_DISCOGS_CONSUMER_SECRET in the
// browser bundle. That's a known, accepted tradeoff for this project so we
// can avoid running a backend — don't reuse this pattern for a real app.

import axios from "axios";
import type { RequestToken, AccessToken, DiscogsIdentity } from "../types/discogsOAuth";
import { DISCOGS_BASE_URL as BASE_URL } from "./discogsConfig";

const CONSUMER_KEY = import.meta.env.VITE_DISCOGS_CONSUMER_KEY;
const CONSUMER_SECRET = import.meta.env.VITE_DISCOGS_CONSUMER_SECRET;
const USER_AGENT = "MusicApi/1.0";

/** Generates a random OAuth nonce string. */
function nonce(): string {
    return Math.random().toString(36).slice(2);
}

/** Current Unix timestamp (seconds), as required by the OAuth spec. */
function timestamp(): string {
    return String(Math.floor(Date.now() / 1000));
}

/** Serializes OAuth parameters into an `OAuth ...` Authorization header value. */
function buildAuthHeader(params: Record<string, string>): string {
    return "OAuth " + Object.entries(params)
        .map(([key, value]) => `${key}="${encodeURIComponent(value)}"`)
        .join(", ");
}

/**
 * Builds an Authorization header for any authenticated Discogs request
 * (beyond just the token endpoints) using an already-issued access token.
 */
export function authHeaderFor(accessToken: string, accessTokenSecret: string): string {
    return buildAuthHeader({
        oauth_consumer_key: CONSUMER_KEY,
        oauth_nonce: nonce(),
        oauth_token: accessToken,
        oauth_signature: `${CONSUMER_SECRET}&${accessTokenSecret}`,
        oauth_signature_method: "PLAINTEXT",
        oauth_timestamp: timestamp(),
    });
}

export const discogsOAuthService = {
    /**
     * Step 1: get a short-lived request token and send the user to Discogs
     * to approve it.
     *
     * NOTE: this sends the oauth_* fields as query params instead of an
     * Authorization header. Discogs' CORS config for /oauth/request_token
     * and /oauth/access_token only allows HEAD/OPTIONS on preflight (no
     * GET!), so a browser blocks the real request before it's even sent if
     * we use a custom header here. Query params keep this a "simple"
     * cross-origin request (no custom headers), which skips preflight
     * entirely. /oauth/identity and other data endpoints don't have this
     * problem, so they still use the Authorization header below.
     */
    async getRequestToken(callbackUrl: string): Promise<RequestToken> {
        const response = await axios.get<string>(`${BASE_URL}/oauth/request_token`, {
            params: {
                oauth_consumer_key: CONSUMER_KEY,
                oauth_nonce: nonce(),
                oauth_signature: `${CONSUMER_SECRET}&`,
                oauth_signature_method: "PLAINTEXT",
                oauth_timestamp: timestamp(),
                oauth_callback: callbackUrl,
            },
        });

        const parsed = new URLSearchParams(response.data);
        return {
            oauthToken: parsed.get("oauth_token") ?? "",
            oauthTokenSecret: parsed.get("oauth_token_secret") ?? "",
        };
    },

    /** Builds the URL to redirect the user to so they can approve the request token. */
    getAuthorizeUrl(requestToken: string): string {
        return `https://www.discogs.com/oauth/authorize?oauth_token=${requestToken}`;
    },

    /**
     * Step 2: exchange the user-approved request token for a permanent
     * access token. Same CORS caveat as `getRequestToken` above — query
     * params, not a header.
     */
    async getAccessToken(requestToken: string, requestTokenSecret: string, verifier: string): Promise<AccessToken> {
        const response = await axios.get<string>(`${BASE_URL}/oauth/access_token`, {
            params: {
                oauth_consumer_key: CONSUMER_KEY,
                oauth_nonce: nonce(),
                oauth_token: requestToken,
                oauth_signature: `${CONSUMER_SECRET}&${requestTokenSecret}`,
                oauth_signature_method: "PLAINTEXT",
                oauth_timestamp: timestamp(),
                oauth_verifier: verifier,
            },
        });

        const parsed = new URLSearchParams(response.data);
        return {
            oauthToken: parsed.get("oauth_token") ?? "",
            oauthTokenSecret: parsed.get("oauth_token_secret") ?? "",
        };
    },

    /** Confirms which Discogs account the access token belongs to. */
    async getIdentity(accessToken: string, accessTokenSecret: string): Promise<DiscogsIdentity> {
        const response = await axios.get<DiscogsIdentity>(`${BASE_URL}/oauth/identity`, {
            headers: {
                Authorization: authHeaderFor(accessToken, accessTokenSecret),
                "User-Agent": USER_AGENT,
            },
        });
        return response.data;
    },
};
