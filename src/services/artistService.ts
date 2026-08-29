// Service file for the Artist page: artist profile, their own releases, and
// resolving an artist's name to a Discogs artist id.

import axios from "axios";
import type { ArtistProfile, ArtistReleasesResponse, ArtistRelease } from "../types/artist";
import type { SearchResponse } from "../types/search";
import { DISCOGS_BASE_URL as BASE_URL, DISCOGS_TOKEN as TOKEN } from "./discogsConfig";

/** Fetches a Discogs artist's profile by id. */
export const getArtist = async (id: string | number): Promise<ArtistProfile> => {
    const response = await axios.get<ArtistProfile>(`${BASE_URL}/artists/${id}`, {
        params: { token: TOKEN },
    });
    return response.data;
};

export interface ArtistReleasesResult {
    releases: ArtistRelease[];
    pagination: ArtistReleasesResponse["pagination"];
}

/**
 * Fetches an artist's own releases (newest first), narrowed down to role
 * "Main" (not a guest spot/remix/compilation appearance) — matching "what
 * albums they've released."
 *
 * Entries come back as either a concrete "release" or a "master" grouping —
 * masters have no /releases/{id} page of their own, so they're resolved to
 * their designated main_release id instead of being dropped (dropping them
 * silently hid real releases: newer or multi-pressing albums are often
 * catalogued as masters, not releases).
 */
export const getArtistReleases = async (id: string | number, page?: number): Promise<ArtistReleasesResult> => {
    const response = await axios.get<ArtistReleasesResponse>(`${BASE_URL}/artists/${id}/releases`, {
        params: { token: TOKEN, page, sort: "year", sort_order: "desc" },
    });

    const seenIds = new Set<number>();
    const releases: ArtistRelease[] = [];
    for (const raw of response.data.releases) {
        if (raw.role !== "Main") continue;
        const releaseId = raw.type === "master" ? raw.main_release : raw.id;
        if (!releaseId || seenIds.has(releaseId)) continue;
        seenIds.add(releaseId);
        releases.push({ id: releaseId, title: raw.title, year: raw.year, resource_url: raw.resource_url });
    }

    return { releases, pagination: response.data.pagination };
};

/**
 * Catalog rows only have an artist's name (Discogs' /database/search for
 * releases doesn't include an artist id), so this resolves that name to an
 * id via an artist search. Picks the first/best match — ambiguous for a name
 * shared by multiple artists (Discogs itself disambiguates those with a
 * suffix like "Rush (2)"), which is an accepted simplification here.
 *
 * Throws if no matching artist is found.
 */
export const findArtistIdByName = async (name: string): Promise<number> => {
    const response = await axios.get<SearchResponse>(`${BASE_URL}/database/search`, {
        params: { type: "artist", q: name, token: TOKEN },
    });
    const match = response.data.results[0];
    if (!match) {
        throw new Error(`No Discogs artist found matching "${name}"`);
    }
    return match.id;
};
