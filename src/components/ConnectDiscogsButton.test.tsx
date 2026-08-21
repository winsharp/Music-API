import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ConnectDiscogsButton from "./ConnectDiscogsButton";
import { useAuth } from "../contexts/AuthContext";
import { discogsAuthStorage } from "../services/discogsAuthStorage";
import { discogsOAuthService } from "../services/discogsOAuthService";

vi.mock("../contexts/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../services/discogsOAuthService", () => ({
    discogsOAuthService: {
        getRequestToken: vi.fn(),
        getAuthorizeUrl: vi.fn(),
    },
}));

const mockUser = { id: "user-1", username: "jdoe", email: "jdoe@example.com" };

describe("ConnectDiscogsButton", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn() });
    });

    it("shows a connect button when no Discogs account is linked", () => {
        render(<ConnectDiscogsButton />);

        expect(screen.getByRole("button", { name: "Connect Discogs Account" })).toBeInTheDocument();
    });

    it("shows the connected username and a disconnect button when linked", () => {
        discogsAuthStorage.saveConnection(mockUser.id, {
            discogsUsername: "memory",
            oauthToken: "tok",
            oauthTokenSecret: "secret",
        });

        render(<ConnectDiscogsButton />);

        expect(screen.getByText(/Connected to Discogs as memory/)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Disconnect" })).toBeInTheDocument();
    });

    it("clears the stored connection when Disconnect is clicked", async () => {
        discogsAuthStorage.saveConnection(mockUser.id, {
            discogsUsername: "memory",
            oauthToken: "tok",
            oauthTokenSecret: "secret",
        });

        render(<ConnectDiscogsButton />);
        await userEvent.click(screen.getByRole("button", { name: "Disconnect" }));

        expect(discogsAuthStorage.getConnection(mockUser.id)).toBeNull();
        expect(screen.getByRole("button", { name: "Connect Discogs Account" })).toBeInTheDocument();
    });

    it("requests a token and redirects to Discogs when Connect is clicked", async () => {
        vi.mocked(discogsOAuthService.getRequestToken).mockResolvedValue({
            oauthToken: "req-token",
            oauthTokenSecret: "req-secret",
        });
        vi.mocked(discogsOAuthService.getAuthorizeUrl).mockReturnValue("https://www.discogs.com/oauth/authorize?oauth_token=req-token");

        const originalLocation = window.location;
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { ...originalLocation, href: "" },
        });

        render(<ConnectDiscogsButton />);
        await userEvent.click(screen.getByRole("button", { name: "Connect Discogs Account" }));

        expect(discogsOAuthService.getRequestToken).toHaveBeenCalled();
        expect(window.location.href).toBe("https://www.discogs.com/oauth/authorize?oauth_token=req-token");

        Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
    });
});
