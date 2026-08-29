// Service file to talk to Discogs and get it to hand data back.

import axios from "axios";
import type { SearchResponse } from "../types/search";
import { DISCOGS_BASE_URL as BASE_URL, DISCOGS_TOKEN as TOKEN } from "./discogsConfig";

/** How many results to show per page of search results. */
const PER_PAGE = 25;

interface SearchParams {
    query: string;
    genre?: string;
    page?: number;
}

/** Searches Discogs releases by free-text query, optionally filtered by genre. */
export const searchReleases = async ({
    query,
    genre,
    page,
}: SearchParams): Promise<SearchResponse> => {
    const response = await axios.get<SearchResponse>(`${BASE_URL}/database/search`, {
        params: {
            q: query,
            type: "release",
            genre,
            token: TOKEN,
            page,
            per_page: PER_PAGE,
        },
    });
    // axios wraps the response object; .data is the JSON body we actually want.
    return response.data;
};
