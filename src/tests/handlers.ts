import { http, HttpResponse } from "msw";
import { mockSearchResults } from "./search.mock";

const BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;

export const handlers = [
    http.get(`${BASE_URL}/database/search`, () => {
        return HttpResponse.json({
            pagination: { page: 1, pages: 1, per_page: 50, items: mockSearchResults.length },
            results: mockSearchResults,
        });
    }),
];