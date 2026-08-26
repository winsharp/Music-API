// Service file for adding releases to a user's Discogs collection and
// rating them. Requires the user to have a linked Discogs OAuth connection.
//
// NOTE: Discogs does not allow POSTing new releases directly to folder 0
// (the "All" virtual folder). We add to folder 1 ("Uncategorized," which
// every account has by default) — the release then automatically also
// appears when reading folder 0.

import axios from "axios";
import type { DiscogsConnection } from "../types/discogsOAuth";
import { authHeaderFor } from "./discogsOAuthService";

const BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;
const DEFAULT_FOLDER_ID = 1; // "Uncategorized" — the default writable folder

export const releaseCollectionService = {
    // Adds a release to the user's collection. Returns the new instance_id,
    // which Discogs needs later to update the rating on this exact copy.
    async addToCollection(
        connection: DiscogsConnection,
        releaseId: number
    ): Promise<{ instance_id: number }> {
        const response = await axios.post(
            `${BASE_URL}/users/${connection.discogsUsername}/collection/folders/${DEFAULT_FOLDER_ID}/releases/${releaseId}`,
            {},
            {
                headers: {
                    Authorization: authHeaderFor(connection.oauthToken, connection.oauthTokenSecret),
                },
            }
        );
        return response.data;
    },

    // Updates the 0-5 rating on a release already sitting in the collection.
    async rateRelease(
        connection: DiscogsConnection,
        releaseId: number,
        instanceId: number,
        rating: number
    ): Promise<void> {
        await axios.post(
            `${BASE_URL}/users/${connection.discogsUsername}/collection/folders/${DEFAULT_FOLDER_ID}/releases/${releaseId}/instances/${instanceId}`,
            { rating: String(rating) },
            {
                headers: {
                    Authorization: authHeaderFor(connection.oauthToken, connection.oauthTokenSecret),
                },
            }
        );
    },
    // Checks whether a release is already in the user's collection (in the
// default folder), so we don't create a duplicate entry on every page load.
// Returns the existing instance_id/rating if found, or null if not.
    async findExistingEntry(
        connection: DiscogsConnection,
        releaseId: number
    ): Promise<{ instance_id: number; rating: number } | null> {
        const response = await axios.get(
            `${BASE_URL}/users/${connection.discogsUsername}/collection/folders/${DEFAULT_FOLDER_ID}/releases/${releaseId}`,
            {
                headers: {
                    Authorization: authHeaderFor(connection.oauthToken, connection.oauthTokenSecret),
                },
            }
        );
        const releases = response.data.releases;
        if (!releases || releases.length === 0) return null;
        return { instance_id: releases[0].instance_id, rating: releases[0].rating };
    },
};