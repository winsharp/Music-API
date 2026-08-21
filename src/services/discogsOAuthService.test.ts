import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../tests/server";
import { discogsOAuthService, authHeaderFor } from "./discogsOAuthService";

const BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;

describe("discogsOAuthService", () => {
    describe("getRequestToken", () => {
        // Signed via query params, not an Authorization header — Discogs'
        // CORS preflight for this endpoint doesn't allow GET with custom
        // headers, so a header-based request would be blocked by the browser.
        it("signs the request via query params (no custom headers) and parses the form-encoded response", async () => {
            let receivedUrl: URL | null = null;
            let receivedAuthHeader: string | null = null;

            server.use(
                http.get(`${BASE_URL}/oauth/request_token`, ({ request }) => {
                    receivedUrl = new URL(request.url);
                    receivedAuthHeader = request.headers.get("Authorization");
                    return HttpResponse.text("oauth_token=req-token&oauth_token_secret=req-secret&oauth_callback_confirmed=true");
                })
            );

            const token = await discogsOAuthService.getRequestToken("https://app.example.com/discogs/callback");

            expect(token).toEqual({ oauthToken: "req-token", oauthTokenSecret: "req-secret" });
            expect(receivedAuthHeader).toBeNull();
            expect(receivedUrl?.searchParams.get("oauth_signature_method")).toBe("PLAINTEXT");
            expect(receivedUrl?.searchParams.get("oauth_callback")).toBe("https://app.example.com/discogs/callback");
        });
    });

    describe("getAuthorizeUrl", () => {
        it("builds the Discogs authorize URL for a request token", () => {
            expect(discogsOAuthService.getAuthorizeUrl("req-token")).toBe(
                "https://www.discogs.com/oauth/authorize?oauth_token=req-token"
            );
        });
    });

    describe("getAccessToken", () => {
        it("exchanges a verified request token for an access token", async () => {
            server.use(
                http.get(`${BASE_URL}/oauth/access_token`, () => {
                    return HttpResponse.text("oauth_token=access-token&oauth_token_secret=access-secret");
                })
            );

            const token = await discogsOAuthService.getAccessToken("req-token", "req-secret", "verifier-123");

            expect(token).toEqual({ oauthToken: "access-token", oauthTokenSecret: "access-secret" });
        });
    });

    describe("getIdentity", () => {
        it("returns the identity for the given access token", async () => {
            server.use(
                http.get(`${BASE_URL}/oauth/identity`, () => {
                    return HttpResponse.json({ id: 1, username: "memory", resource_url: "https://api.discogs.com/users/memory" });
                })
            );

            const identity = await discogsOAuthService.getIdentity("access-token", "access-secret");

            expect(identity.username).toBe("memory");
        });
    });

    describe("authHeaderFor", () => {
        it("builds a PLAINTEXT Authorization header from an access token/secret", () => {
            const header = authHeaderFor("access-token", "access-secret");

            expect(header).toContain('oauth_token="access-token"');
            expect(header).toContain('oauth_signature_method="PLAINTEXT"');
        });
    });
});
