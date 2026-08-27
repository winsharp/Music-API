// Shared shape of Discogs' paginated list responses (search, artist
// releases, collection, lists, wantlist, ...) — see:
// https://www.discogs.com/developers#page:home,header:home-pagination
export interface DiscogsPagination {
    page: number;
    pages: number;
    per_page: number;
    items: number;
}
