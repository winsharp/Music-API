//The types file

//describes the shape of only ONE item Discogs gives
//us back like an album or release
//?-means that a value may not always be present
export interface SearchResult{
    id: number;
    type: string;
    title: string;
    thumb: string;
    year?: string;
    genre?: string[];
    style?:string[];
    format?:string[];
    country?: string;
    resource_url: string;
}

//describes the entire API response
//wraps a list of results +
// pagination(splitting large content into smaller separate pages
export interface SearchResponse{
    pagination:{
        page: number;
        pages: number;
        per_page: number;
        items: number;
    };
    results:SearchResult[];
}