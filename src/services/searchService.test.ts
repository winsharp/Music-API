import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../tests/server";
import { searchReleases } from "./searchService";
import { mockSearchResults } from "../tests/search.mock";

const BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;

describe("searchReleases", () => {
    it("sends the query and genre through as query params", async () => {
        let capturedQuery: string | null = null;
        let capturedGenre: string | null = null;
        server.use(
            http.get(`${BASE_URL}/database/search`, ({ request }) => {
                const url = new URL(request.url);
                capturedQuery = url.searchParams.get("q");
                capturedGenre = url.searchParams.get("genre");
                return HttpResponse.json({
                    pagination: { page: 1, pages: 1, per_page: 50, items: mockSearchResults.length },
                    results: mockSearchResults,
                });
            })
        );

        const data = await searchReleases({ query: "nirvana", genre: "Rock" });
        expect(capturedQuery).toBe("nirvana");
        expect(capturedGenre).toBe("Rock");
        expect(data.results).toEqual(mockSearchResults);
    });

    it("caps results at 25 per page", async () => {
        let capturedPerPage: string | null = null;
        server.use(
            http.get(`${BASE_URL}/database/search`, ({ request }) => {
                const url = new URL(request.url);
                capturedPerPage = url.searchParams.get("per_page");
                return HttpResponse.json({
                    pagination: { page: 1, pages: 1, per_page: 25, items: mockSearchResults.length },
                    results: mockSearchResults,
                });
            })
        );

        await searchReleases({ query: "nirvana" });
        expect(capturedPerPage).toBe("25");
    });

    it("sends the page number through as a query param", async () => {
        let capturedPage: string | null = null;
        server.use(
            http.get(`${BASE_URL}/database/search`, ({ request }) => {
                const url = new URL(request.url);
                capturedPage = url.searchParams.get("page");
                return HttpResponse.json({
                    pagination: { page: 3, pages: 10, per_page: 50, items: 500 },
                    results: [],
                });
            })
        );

        await searchReleases({ query: "nirvana", page: 3 });
        expect(capturedPage).toBe("3");
    });
});
