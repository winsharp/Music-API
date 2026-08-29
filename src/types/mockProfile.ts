/** One release in a `MockProfile`'s demo "rated releases" list. */
export interface MockRatedRelease {
    /** Discogs release id. */
    id: number;
    title: string;
    artist: string;
    /** 1-5. */
    rating: number;
    thumb: string;
}

/**
 * A canned demo profile (see `src/tests/mockProfiles.ts`) that `ProfilePage`
 * and `ProfileSectionPage` can render in place of a real Discogs account —
 * used so rated-release lists can be demoed without a live account that has
 * real rating data.
 */
export interface MockProfile {
    username: string;
    avatarUrl?: string;
    ratedReleases: MockRatedRelease[];
}