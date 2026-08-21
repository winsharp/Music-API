import { describe, it, expect, beforeEach } from "vitest";
import { discogsAuthStorage } from "./discogsAuthStorage";

const connection = { discogsUsername: "memory", oauthToken: "tok", oauthTokenSecret: "secret" };

describe("discogsAuthStorage", () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    describe("connection", () => {
        it("returns null when nothing is stored for the user", () => {
            expect(discogsAuthStorage.getConnection("user-1")).toBeNull();
        });

        it("saves and retrieves a connection scoped to a user id", () => {
            discogsAuthStorage.saveConnection("user-1", connection);

            expect(discogsAuthStorage.getConnection("user-1")).toEqual(connection);
            expect(discogsAuthStorage.getConnection("user-2")).toBeNull();
        });

        it("clears a stored connection", () => {
            discogsAuthStorage.saveConnection("user-1", connection);

            discogsAuthStorage.clearConnection("user-1");

            expect(discogsAuthStorage.getConnection("user-1")).toBeNull();
        });

        it("returns null when the stored value is malformed", () => {
            localStorage.setItem("music-api:discogs-auth:user-1", "not json");

            expect(discogsAuthStorage.getConnection("user-1")).toBeNull();
        });
    });

    describe("pending request token", () => {
        it("returns null when nothing is pending", () => {
            expect(discogsAuthStorage.takePendingRequestToken()).toBeNull();
        });

        it("saves and consumes a pending request token exactly once", () => {
            const token = { oauthToken: "req-token", oauthTokenSecret: "req-secret" };
            discogsAuthStorage.savePendingRequestToken(token);

            expect(discogsAuthStorage.takePendingRequestToken()).toEqual(token);
            expect(discogsAuthStorage.takePendingRequestToken()).toBeNull();
        });
    });
});
