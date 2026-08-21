import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../tests/server";
import { browseReleases } from "./browseService";
import { mockBrowseResults } from "../tests/browse.mock";

const BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;

describe("browseReleases", () => {
    it("returns releases without requiring a search query", async () => {
        server.use(
            http.get(`${BASE_URL}/database/search`, ({ request }) => {
                const url = new URL(request.url);
                expect(url.searchParams.get("q")).toBeNull();
                expect(url.searchParams.get("type")).toBe("release");
                return HttpResponse.json({
                    pagination: { page: 1, pages: 1, per_page: 50, items: mockBrowseResults.length },
                    results: mockBrowseResults,
                });
            })
        );

        const data = await browseReleases({ genre: "Rock" });
        expect(data.results).toEqual(mockBrowseResults);
    });

    it("sends the genre filter through as a query param", async () => {
        let capturedGenre: string | null = null;
        server.use(
            http.get(`${BASE_URL}/database/search`, ({ request }) => {
                const url = new URL(request.url);
                capturedGenre = url.searchParams.get("genre");
                return HttpResponse.json({
                    pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
                    results: [],
                });
            })
        );

        await browseReleases({ genre: "Jazz" });
        expect(capturedGenre).toBe("Jazz");
    });
});
