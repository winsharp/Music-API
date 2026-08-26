import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../tests/server";
import { getArtist, getArtistReleases, findArtistIdByName } from "./artistService";
import { mockArtistProfile, mockArtistReleases, mockRawArtistReleases } from "../tests/artist.mock";

const BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;

describe("getArtist", () => {
    it("fetches an artist profile by id", async () => {
        server.use(
            http.get(`${BASE_URL}/artists/3840`, () => {
                return HttpResponse.json(mockArtistProfile);
            })
        );

        const data = await getArtist(3840);
        expect(data).toEqual(mockArtistProfile);
    });
});

describe("getArtistReleases", () => {
    it("resolves 'master' grouping entries to their main_release id instead of dropping them", async () => {
        // Regression case: Discogs represents some of an artist's own
        // releases (e.g. ARTMS's "Hyper-Ego") as a master grouping rather
        // than a concrete release. Dropping type==="master" entirely used to
        // silently hide those from the artist's release list.
        server.use(
            http.get(`${BASE_URL}/artists/3840/releases`, () => {
                return HttpResponse.json({
                    pagination: { page: 1, pages: 1, per_page: 50, items: mockRawArtistReleases.length },
                    releases: mockRawArtistReleases,
                });
            })
        );

        const data = await getArtistReleases(3840);
        expect(data.releases).toEqual(mockArtistReleases);
        expect(data.releases.find((r) => r.title === "Kid A")?.id).toBe(249504);
    });

    it("filters out non-Main credits and master entries with no main_release", async () => {
        server.use(
            http.get(`${BASE_URL}/artists/3840/releases`, () => {
                return HttpResponse.json({
                    pagination: { page: 1, pages: 1, per_page: 50, items: 3 },
                    releases: [
                        ...mockRawArtistReleases,
                        {
                            id: 2,
                            title: "Compilation They Appeared On",
                            year: 2005,
                            type: "release",
                            role: "Appearance",
                            resource_url: "https://api.discogs.com/releases/2",
                        },
                        {
                            id: 3,
                            title: "Master With No Main Release Listed",
                            year: 2010,
                            type: "master",
                            role: "Main",
                            resource_url: "https://api.discogs.com/masters/3",
                        },
                    ],
                });
            })
        );

        const data = await getArtistReleases(3840);
        expect(data.releases).toEqual(mockArtistReleases);
    });

    it("de-duplicates when two raw entries resolve to the same release id", async () => {
        server.use(
            http.get(`${BASE_URL}/artists/3840/releases`, () => {
                return HttpResponse.json({
                    pagination: { page: 1, pages: 1, per_page: 50, items: 2 },
                    releases: [
                        mockRawArtistReleases[0], // type: "release", id 1587168
                        {
                            // a different raw list entry (different master id)
                            // that happens to resolve to the same release
                            id: 555,
                            title: "OK Computer",
                            year: 1997,
                            type: "master",
                            role: "Main",
                            main_release: 1587168,
                            resource_url: "https://api.discogs.com/masters/555",
                        },
                    ],
                });
            })
        );

        const data = await getArtistReleases(3840);
        expect(data.releases).toHaveLength(1);
    });

    it("passes the page number through as a query param", async () => {
        let capturedPage: string | null = null;
        server.use(
            http.get(`${BASE_URL}/artists/3840/releases`, ({ request }) => {
                capturedPage = new URL(request.url).searchParams.get("page");
                return HttpResponse.json({
                    pagination: { page: 2, pages: 5, per_page: 50, items: 200 },
                    releases: [],
                });
            })
        );

        await getArtistReleases(3840, 2);
        expect(capturedPage).toBe("2");
    });
});

describe("findArtistIdByName", () => {
    it("resolves a name to the first matching artist id", async () => {
        server.use(
            http.get(`${BASE_URL}/database/search`, ({ request }) => {
                const url = new URL(request.url);
                expect(url.searchParams.get("type")).toBe("artist");
                expect(url.searchParams.get("q")).toBe("Radiohead");
                return HttpResponse.json({
                    pagination: { page: 1, pages: 1, per_page: 50, items: 1 },
                    results: [{ id: 3840, type: "artist", title: "Radiohead", thumb: "", resource_url: "" }],
                });
            })
        );

        const id = await findArtistIdByName("Radiohead");
        expect(id).toBe(3840);
    });

    it("throws when no artist matches", async () => {
        server.use(
            http.get(`${BASE_URL}/database/search`, () => {
                return HttpResponse.json({
                    pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
                    results: [],
                });
            })
        );

        await expect(findArtistIdByName("Definitely Not A Real Artist")).rejects.toThrow(
            /no discogs artist found/i
        );
    });
});
