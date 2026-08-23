// Service file to talk to Discogs about a given user's public profile,
// collection, and ratings. All read-only — we don't store any of this
// ourselves, we just call Discogs directly.

import axios from "axios";
import type {
    DiscogsUserProfile,
    CollectionReleasesResponse,
    DiscogsListsResponse,
    DiscogsListDetail,
    WantlistResponse,
} from "../types/discogsUser";
import type { DiscogsConnection } from "../types/discogsOAuth";
import { authHeaderFor } from "./discogsOAuthService";

const BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;
const TOKEN = import.meta.env.VITE_DISCOGS_TOKEN;

// If the caller has a linked OAuth connection for this exact username, sign
// the request with it instead of the app's anonymous token — that's what
// lets private data (collection, private lists) show up for their owner.
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

    // User-created lists (e.g. "Best Jazz Albums of 1960s") — separate from
    // Collection/Wantlist. Private lists only show up when authenticated as
    // the owner.
    async getLists(username: string, connection?: DiscogsConnection | null): Promise<DiscogsListsResponse> {
        const response = await axios.get<DiscogsListsResponse>(
            `${BASE_URL}/users/${username}/lists`,
            authConfig(username, connection)
        );
        return response.data;
    },

    // List summaries don't include items — fetch each list by id to get them.
    async getListDetail(listId: number, connection?: DiscogsConnection | null): Promise<DiscogsListDetail> {
        const config = connection
            ? { headers: { Authorization: authHeaderFor(connection.oauthToken, connection.oauthTokenSecret) } }
            : { params: { token: TOKEN } };
        const response = await axios.get<DiscogsListDetail>(`${BASE_URL}/lists/${listId}`, config);
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
