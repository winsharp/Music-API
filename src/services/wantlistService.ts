// Service file for adding/removing releases from a user's Discogs wantlist.
// Requires the user to have a linked Discogs OAuth connection.

import axios from "axios";
import type { DiscogsConnection } from "../types/discogsOAuth";
import { authHeaderFor } from "./discogsOAuthService";
import { DISCOGS_BASE_URL as BASE_URL } from "./discogsConfig";

export const wantlistService = {
    /**
     * Adds a release to the user's wantlist. Idempotent on Discogs' side —
     * calling it again for a release already on the wantlist just updates it.
     */
    async addToWantlist(connection: DiscogsConnection, releaseId: number): Promise<void> {
        await axios.put(
            `${BASE_URL}/users/${connection.discogsUsername}/wants/${releaseId}`,
            {},
            {
                headers: {
                    Authorization: authHeaderFor(connection.oauthToken, connection.oauthTokenSecret),
                },
            }
        );
    },

    /** Removes a release from the user's wantlist. */
    async removeFromWantlist(connection: DiscogsConnection, releaseId: number): Promise<void> {
        await axios.delete(
            `${BASE_URL}/users/${connection.discogsUsername}/wants/${releaseId}`,
            {
                headers: {
                    Authorization: authHeaderFor(connection.oauthToken, connection.oauthTokenSecret),
                },
            }
        );
    },
};
