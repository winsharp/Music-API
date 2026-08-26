// Shape of the Discogs Database API's single-release resource
// (GET /releases/{id}). Unlike search results, this includes the
// community have/want counts and marketplace lowest_price/num_for_sale
// fields we use to build the homepage's featured sections.
// See: https://www.discogs.com/developers (Database > Release)

export interface DiscogsReleaseArtist {
    name: string;
}

export interface DiscogsReleaseDetail {
    id: number;
    title: string;
    thumb?: string;
    year?: number;
    artists?: DiscogsReleaseArtist[];
    community?: {
        have: number;
        want: number;
    };
    lowest_price?: number | null;
    num_for_sale?: number;
}
