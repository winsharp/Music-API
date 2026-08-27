// Shapes from GET /artists/{id} and GET /artists/{id}/releases.
import type { DiscogsPagination } from "./pagination";

export interface ArtistProfile {
    id: number;
    name: string;
    profile?: string;
}

// Raw shape of one entry from GET /artists/{id}/releases, before
// artistService narrows/resolves it. Discogs mixes actual releases
// ("release") with grouped "master" entries — masters don't have their own
// /releases/{id} page, but carry a `main_release` id that does — and various
// contributor roles (e.g. "Main", "Appearance", "Remix").
export interface RawArtistRelease {
    id: number;
    title: string;
    year?: number;
    type: string;
    role?: string;
    main_release?: number;
    resource_url: string;
}

// What a page actually gets: the artist's own releases, each with an `id`
// that's always safe to link to /release/{id}.
export interface ArtistRelease {
    id: number;
    title: string;
    year?: number;
    resource_url: string;
}

export interface ArtistReleasesResponse {
    pagination: DiscogsPagination;
    releases: RawArtistRelease[];
}
