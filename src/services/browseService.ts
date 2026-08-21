// Service file to browse Discogs releases by genre, without needing a search query.

import axios from "axios";
import type { SearchResponse } from "../types/search";

const BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;
const TOKEN = import.meta.env.VITE_DISCOGS_TOKEN;

interface BrowseParams {
    genre?: string;
}

export const browseReleases = async ({ genre }: BrowseParams): Promise<SearchResponse> => {
    const response = await axios.get<SearchResponse>(`${BASE_URL}/database/search`, {
        params: {
            type: "release",
            genre,
            token: TOKEN,
            sort: "year",
            sort_order: "desc",
        },
    });
    return response.data;
};
