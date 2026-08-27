// Shapes for the Discogs User Identity / Collection endpoints.
// See: https://www.discogs.com/developers (User Identity, User Collection)

export interface DiscogsUserProfile {
    username: string;
    profile: string;
    avatar_url?: string;
    location?: string;
    num_collection: number;
    num_wantlist: number;
    num_lists: number;
    releases_rated: number;
    rating_avg: number;
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
    basic_information: {
        id: number;
        title: string;
        thumb?: string;
        year?: number;
        artists?: { name: string }[];
    };
}

export interface CollectionReleasesResponse {
    pagination: {
        page: number;
        pages: number;
        per_page: number;
        items: number;
    };
    releases: CollectionRelease[];
}

// A user-created list (separate from Collection/Wantlist), e.g. "Best Jazz
// Albums of 1960s". Summaries don't include items; fetch by id for those.
export interface DiscogsListSummary {
    id: number;
    name: string;
    description?: string;
    public: boolean;
    image_url?: string;
}

export interface DiscogsListsResponse {
    pagination: {
        page: number;
        pages: number;
        per_page: number;
        items: number;
    };
    lists: DiscogsListSummary[];
}

export interface DiscogsListItem {
    id: number;
    type: "release" | "master" | "artist" | "label";
    display_title: string;
    image_url?: string;
    uri?: string;
}

export interface DiscogsListDetail extends DiscogsListSummary {
    items: DiscogsListItem[];
}

// A single release on a user's wantlist. Notes are only visible when
// authenticated as the wantlist owner.
export interface WantlistItem {
    id: number;
    rating: number;
    date_added: string;
    notes?: string;
    basic_information: {
        id: number;
        title: string;
        thumb?: string;
        year?: number;
        artists?: { name: string }[];
    };
}

export interface WantlistResponse {
    pagination: {
        page: number;
        pages: number;
        per_page: number;
        items: number;
    };
    wants: WantlistItem[];
}
