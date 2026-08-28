// Shapes for the Discogs User Identity / Collection endpoints.
// See: https://www.discogs.com/developers (User Identity, User Collection)
import type { DiscogsPagination } from "./pagination";

export interface DiscogsUserProfile {
    username: string;
    profile: string;
    avatar_url?: string;
    location?: string;
    num_collection: number;
    num_wantlist: number;
    releases_rated: number;
    rating_avg: number;
}

// The release summary shared by every Discogs endpoint that embeds a
// release inside something else (a collection item, a wantlist item, ...)
// — as opposed to ReleaseDetail (types/release.ts), the full standalone
// GET /releases/{id} shape.
export interface DiscogsBasicInformation {
    id: number;
    title: string;
    thumb?: string;
    year?: number;
    artists?: { name: string }[];
}

// A single release inside a user's "All" collection folder.
// `rating` is that user's own 0-5 rating for the release, straight from Discogs.
// Discogs doesn't track *when* a release was rated, only `date_added` (when
// it was added to the collection) — we use that as the closest available
// proxy for "recently rated".
export interface CollectionRelease {
    id: number;
    instance_id: number;
    rating: number;
    date_added: string;
    basic_information: DiscogsBasicInformation;
}

export interface CollectionReleasesResponse {
    pagination: DiscogsPagination;
    releases: CollectionRelease[];
}

// A single release on a user's wantlist. Notes are only visible when
// authenticated as the wantlist owner.
export interface WantlistItem {
    id: number;
    rating: number;
    date_added: string;
    notes?: string;
    basic_information: DiscogsBasicInformation;
}

export interface WantlistResponse {
    pagination: DiscogsPagination;
    wants: WantlistItem[];
}
