import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../tests/server";
import { wantlistService } from "./wantlistService";
import type { DiscogsConnection } from "../types/discogsOAuth";

const BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;

const mockConnection: DiscogsConnection = {
    discogsUsername: "testuser",
    oauthToken: "fake-token",
    oauthTokenSecret: "fake-secret",
};

describe("wantlistService", () => {
    it("adds a release to the wantlist", async () => {
        let called = false;
        server.use(
            http.put(`${BASE_URL}/users/testuser/wants/8098759`, () => {
                called = true;
                return HttpResponse.json({}, { status: 201 });
            })
        );

        await wantlistService.addToWantlist(mockConnection, 8098759);
        expect(called).toBe(true);
    });

    it("removes a release from the wantlist", async () => {
        let called = false;
        server.use(
            http.delete(`${BASE_URL}/users/testuser/wants/8098759`, () => {
                called = true;
                return new HttpResponse(null, { status: 204 });
            })
        );

        await wantlistService.removeFromWantlist(mockConnection, 8098759);
        expect(called).toBe(true);
    });
});
