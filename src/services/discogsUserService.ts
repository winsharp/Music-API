// Service file to talk to Discogs about a given user's public profile,
// collection, and ratings. All read-only — we don't store any of this
// ourselves, we just call Discogs directly.

import axios from "axios";
import type {
    DiscogsUserProfile,
    CollectionReleasesResponse,
    WantlistResponse,
} from "../types/discogsUser";
import type { DiscogsConnection } from "../types/discogsOAuth";
import { authHeaderFor } from "./discogsOAuthService";
import { DISCOGS_BASE_URL as BASE_URL, DISCOGS_TOKEN as TOKEN } from "./discogsConfig";

// If the caller has a linked OAuth connection for this exact username, sign
// the request with it instead of the app's anonymous token — that's what
// lets private data (collection, wantlist) show up for their owner.
function authConfig(username: string, connection?: DiscogsConnection | null) {
    if (connection && connection.discogsUsername === username) {
        return { headers: { Authorization: authHeaderFor(connection.oauthToken, connection.oauthTokenSecret) } };
    }
    return { params: { token: TOKEN } };
}

export const discogsUserService = {
    async getProfile(username: string): Promise<DiscogsUserProfile> {
        const response = await axios.get<DiscogsUserProfile>(`${BASE_URL}/users/${username}`, {
            params: { token: TOKEN },
        });
        return response.data;
    },

    // Folder 0 is Discogs' built-in "All" folder. For a public collection,
    // this is viewable without the owner being authenticated.
    async getCollection(username: string, connection?: DiscogsConnection | null): Promise<CollectionReleasesResponse> {
        const response = await axios.get<CollectionReleasesResponse>(
            `${BASE_URL}/users/${username}/collection/folders/0/releases`,
            authConfig(username, connection)
        );
        return response.data;
    },

    // Releases the user wants but doesn't own. Private wantlists only show
    // up when authenticated as the owner.
    async getWantlist(username: string, connection?: DiscogsConnection | null): Promise<WantlistResponse> {
        const response = await axios.get<WantlistResponse>(
            `${BASE_URL}/users/${username}/wants`,
            authConfig(username, connection)
        );
        return response.data;
    },
};
