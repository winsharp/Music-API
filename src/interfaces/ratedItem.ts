
export type LibraryItemType = "release" | "master" | "artist" | "track";
 
export interface RatedItem {
    id: string;              // composite key, e.g. `release:12345` or `track:12345:3`
    itemType: LibraryItemType;
    refId: number;           // the Discogs id (release/master/artist id)
    title: string;
    thumb?: string;
    rating: number;          // 1-5
    ratedAt: string;         // ISO date
}