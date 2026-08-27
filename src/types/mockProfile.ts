export interface MockRatedRelease {
    id: number;          // Discogs release id
    title: string;
    artist: string;
    rating: number;       // 1-5
    thumb: string;
}

export interface MockProfile {
    username: string;
    avatarUrl?: string;
    ratedReleases: MockRatedRelease[];
}