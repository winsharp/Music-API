// Shape of a single release from GET /releases/{id}. Distinct from
// types/search.ts's SearchResult, which is the much thinner shape returned
// by the /database/search endpoint used for browsing.
export interface ReleaseArtist {
    id: number;
    name: string;
}

export interface ReleaseTrack {
    position: string;
    // Discogs tracklists can include non-song rows (e.g. a "heading" divider
    // for an LP side or a CD's disc index) alongside actual "track" rows.
    type_: string;
    title: string;
    duration: string;
}

export interface ReleaseDetail {
    id: number;
    title: string;
    year?: number;
    genres?: string[];
    styles?: string[];
    artists?: ReleaseArtist[];
    tracklist?: ReleaseTrack[];
    thumb?: string;
}
