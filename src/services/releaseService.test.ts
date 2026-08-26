import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../tests/server";
import { getRelease } from "./releaseService";
import { mockReleaseDetail } from "../tests/release.mock";

const BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;

describe("getRelease", () => {
    it("fetches a release by id", async () => {
        server.use(
            http.get(`${BASE_URL}/releases/1587168`, () => {
                return HttpResponse.json(mockReleaseDetail);
            })
        );

        const data = await getRelease(1587168);
        expect(data).toEqual(mockReleaseDetail);
    });

    it("propagates a 404 for an unknown release id", async () => {
        server.use(
            http.get(`${BASE_URL}/releases/999999999`, () => {
                return new HttpResponse(null, { status: 404 });
            })
        );

        await expect(getRelease(999999999)).rejects.toMatchObject({
            response: { status: 404 },
        });
    });
});
