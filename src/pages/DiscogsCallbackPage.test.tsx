import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DiscogsCallbackPage from "./DiscogsCallbackPage";
import { useAuth } from "../hooks/useAuth";
import { discogsAuthStorage } from "../services/discogsAuthStorage";
import { discogsOAuthService } from "../services/discogsOAuthService";

vi.mock("../hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../services/discogsOAuthService", () => ({
    discogsOAuthService: {
        getAccessToken: vi.fn(),
        getIdentity: vi.fn(),
    },
}));

const mockUser = { id: "user-1", username: "jdoe", email: "jdoe@example.com" };
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    return { ...actual, useNavigate: () => mockNavigate };
});

function renderWithRoute(query: string) {
    return render(
        <MemoryRouter initialEntries={[`/discogs/callback${query}`]}>
            <Routes>
                <Route path="/discogs/callback" element={<DiscogsCallbackPage />} />
            </Routes>
        </MemoryRouter>
    );
}

describe("DiscogsCallbackPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn(), updateUser: vi.fn() });
    });

    it("completes the handshake and redirects to the connected profile", async () => {
        discogsAuthStorage.savePendingRequestToken({ oauthToken: "req-token", oauthTokenSecret: "req-secret" });
        vi.mocked(discogsOAuthService.getAccessToken).mockResolvedValue({
            oauthToken: "access-token",
            oauthTokenSecret: "access-secret",
        });
        vi.mocked(discogsOAuthService.getIdentity).mockResolvedValue({
            id: 1,
            username: "memory",
            resource_url: "https://api.discogs.com/users/memory",
        });

        renderWithRoute("?oauth_token=req-token&oauth_verifier=verifier-123");

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/profile/memory", { replace: true }));
        expect(discogsAuthStorage.getConnection(mockUser.id)).toEqual({
            discogsUsername: "memory",
            oauthToken: "access-token",
            oauthTokenSecret: "access-secret",
        });
    });

    it("shows an error when the request token doesn't match what's pending", async () => {
        discogsAuthStorage.savePendingRequestToken({ oauthToken: "other-token", oauthTokenSecret: "req-secret" });

        renderWithRoute("?oauth_token=req-token&oauth_verifier=verifier-123");

        await waitFor(() =>
            expect(
                screen.getByText("This Discogs connection link is invalid or has expired. Please try connecting again.")
            ).toBeInTheDocument()
        );
        expect(discogsOAuthService.getAccessToken).not.toHaveBeenCalled();
    });

    it("shows an error when the handshake request fails", async () => {
        discogsAuthStorage.savePendingRequestToken({ oauthToken: "req-token", oauthTokenSecret: "req-secret" });
        vi.mocked(discogsOAuthService.getAccessToken).mockRejectedValue(new Error("network error"));

        renderWithRoute("?oauth_token=req-token&oauth_verifier=verifier-123");

        await waitFor(() =>
            expect(screen.getByText("Couldn't finish connecting your Discogs account. Please try again.")).toBeInTheDocument()
        );
    });
});
