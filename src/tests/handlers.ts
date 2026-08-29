// Default MSW (Mock Service Worker) request handlers, installed for every
// test via `server.ts`/`setup.ts`. Individual test files can override these
// per-test with `server.use(...)` for other endpoints/status codes; this
// file only needs to cover requests that don't care about the response.
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