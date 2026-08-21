
// Only albums (Discogs releases/masters) can be rated for now.
export type LibraryItemType = "release" | "master";

export interface RatedItem {
    id: string;              // composite key, e.g. `release:12345`
    itemType: LibraryItemType;
    refId: number;           // the Discogs id (release/master id)
    title: string;
    thumb?: string;
    rating: number;          // 1-5
    ratedAt: string;         // ISO date
}