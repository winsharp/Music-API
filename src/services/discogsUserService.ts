// Service file to talk to Discogs about a given user's public profile,
// collection, and ratings. All read-only — we don't store any of this
// ourselves, we just call Discogs directly.

import axios from "axios";
import type { DiscogsUserProfile, CollectionReleasesResponse } from "../types/discogsUser";
import type { DiscogsConnection } from "../types/discogsOAuth";
import { authHeaderFor } from "./discogsOAuthService";

const BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;
const TOKEN = import.meta.env.VITE_DISCOGS_TOKEN;

export const discogsUserService = {
    async getProfile(username: string): Promise<DiscogsUserProfile> {
        const response = await axios.get<DiscogsUserProfile>(`${BASE_URL}/users/${username}`, {
            params: { token: TOKEN },
        });
        return response.data;
    },

    // Folder 0 is Discogs' built-in "All" folder. For a public collection,
    // this is viewable without the owner being authenticated. If the caller
    // has a linked OAuth connection for this exact username, sign the
    // request with it instead so private collections work for their owner.
    async getCollection(username: string, connection?: DiscogsConnection | null): Promise<CollectionReleasesResponse> {
        const useAuth = connection && connection.discogsUsername === username;
        const response = await axios.get<CollectionReleasesResponse>(
            `${BASE_URL}/users/${username}/collection/folders/0/releases`,
            useAuth
                ? { headers: { Authorization: authHeaderFor(connection.oauthToken, connection.oauthTokenSecret) } }
                : { params: { token: TOKEN } }
        );
        return response.data;
    },
};
