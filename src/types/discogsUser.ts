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
export interface CollectionRelease {
    id: number;
    instance_id: number;
    rating: number;
    basic_information: {
        id: number;
        title: string;
        thumb?: string;
        year?: number;
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
