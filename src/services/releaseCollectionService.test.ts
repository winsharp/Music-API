import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../tests/server";
import { releaseCollectionService } from "./releaseCollectionService";
import type { DiscogsConnection } from "../types/discogsOAuth";

const BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;

const mockConnection: DiscogsConnection = {
    discogsUsername: "testuser",
    oauthToken: "fake-token",
    oauthTokenSecret: "fake-secret",
};

describe("releaseCollectionService", () => {
    it("adds a release to the default folder and returns the instance_id", async () => {
        server.use(
            http.post(
                `${BASE_URL}/users/testuser/collection/folders/1/releases/8098759`,
                () => {
                    return HttpResponse.json({ instance_id: 123456 }, { status: 201 });
                }
            )
        );

        const result = await releaseCollectionService.addToCollection(mockConnection, 8098759);
        expect(result.instance_id).toBe(123456);
    });

    it("sends the rating as a string in the request body", async () => {
        let capturedBody: unknown;
        server.use(
            http.post(
                `${BASE_URL}/users/testuser/collection/folders/1/releases/8098759/instances/123456`,
                async ({ request }) => {
                    capturedBody = await request.json();
                    return HttpResponse.json({}, { status: 204 });
                }
            )
        );

        await releaseCollectionService.rateRelease(mockConnection, 8098759, 123456, 4);
        expect(capturedBody).toEqual({ rating: "4" });
    });

    it("finds an existing entry when the release is already in the collection", async () => {
        server.use(
            http.get(
                `${BASE_URL}/users/testuser/collection/folders/1/releases/8098759`,
                () => {
                    return HttpResponse.json({
                        releases: [{ instance_id: 123456, rating: 4 }],
                    });
                }
            )
        );

        const result = await releaseCollectionService.findExistingEntry(mockConnection, 8098759);
        expect(result).toEqual({ instance_id: 123456, rating: 4 });
    });

    it("returns null when the release is not in the collection", async () => {
        server.use(
            http.get(
                `${BASE_URL}/users/testuser/collection/folders/1/releases/8098759`,
                () => {
                    return HttpResponse.json({ releases: [] });
                }
            )
        );

        const result = await releaseCollectionService.findExistingEntry(mockConnection, 8098759);
        expect(result).toBeNull();
    });
});