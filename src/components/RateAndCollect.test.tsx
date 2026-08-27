import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import RateAndCollect from "./RateAndCollect";
import { useAuth } from "../hooks/useAuth";
import { discogsAuthStorage } from "../services/discogsAuthStorage";
import { releaseCollectionService } from "../services/releaseCollectionService";
import { wantlistService } from "../services/wantlistService";
import type { DiscogsConnection } from "../types/discogsOAuth";

vi.mock("../hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../services/discogsAuthStorage", () => ({
    discogsAuthStorage: {
        getConnection: vi.fn(),
    },
}));

vi.mock("../services/releaseCollectionService", () => ({
    releaseCollectionService: {
        addToCollection: vi.fn(),
        rateRelease: vi.fn(),
    },
}));

vi.mock("../services/wantlistService", () => ({
    wantlistService: {
        addToWantlist: vi.fn(),
        removeFromWantlist: vi.fn(),
    },
}));

const mockUser = { id: "user-1", username: "jdoe", email: "jdoe@example.com" };
const mockConnection: DiscogsConnection = {
    discogsUsername: "jdoe-discogs",
    oauthToken: "fake-token",
    oauthTokenSecret: "fake-secret",
};

beforeEach(() => {
    vi.clearAllMocks();
});

// RateAndCollect uses <Link>/useLocation for the logged-out prompt, so it
// needs a Router context to render.
const renderRateAndCollect = (props: ComponentProps<typeof RateAndCollect>) =>
    render(
        <MemoryRouter initialEntries={["/release/123"]}>
            <RateAndCollect {...props} />
        </MemoryRouter>
    );

describe("RateAndCollect", () => {
    it("prompts an unauthenticated user to log in", () => {
        vi.mocked(useAuth).mockReturnValue({ user: null, login: vi.fn(), logout: vi.fn(), register: vi.fn(), updateUser: vi.fn() });
        renderRateAndCollect({ releaseId: 123 });
        expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/login");
    });

    it("prompts to connect Discogs when logged in but not connected", () => {
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn(), updateUser: vi.fn() });
        vi.mocked(discogsAuthStorage.getConnection).mockReturnValue(null);

        renderRateAndCollect({ releaseId: 123 });
        expect(screen.getByText(/connect your discogs account/i)).toBeInTheDocument();
    });

    it("shows a 'Save to Collection' button when not yet in the collection", () => {
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn(), updateUser: vi.fn() });
        vi.mocked(discogsAuthStorage.getConnection).mockReturnValue(mockConnection);

        renderRateAndCollect({ releaseId: 123 });
        expect(screen.getByRole("button", { name: /save to collection/i })).toBeInTheDocument();
    });

    it("shows star buttons immediately when existingEntry is provided", () => {
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn(), updateUser: vi.fn() });
        vi.mocked(discogsAuthStorage.getConnection).mockReturnValue(mockConnection);

        renderRateAndCollect({ releaseId: 123, existingEntry: { instance_id: 999, rating: 3 } });
        expect(screen.queryByRole("button", { name: /save to collection/i })).not.toBeInTheDocument();
        // 3 filled stars, 2 empty (5 buttons either way) + 1 wantlist button
        expect(screen.getAllByRole("button")).toHaveLength(6);
    });

    it("adds to collection and reveals star buttons after a successful save", async () => {
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn(), updateUser: vi.fn() });
        vi.mocked(discogsAuthStorage.getConnection).mockReturnValue(mockConnection);
        vi.mocked(releaseCollectionService.addToCollection).mockResolvedValue({ instance_id: 555 });

        renderRateAndCollect({ releaseId: 123 });
        await userEvent.click(screen.getByRole("button", { name: /save to collection/i }));

        expect(releaseCollectionService.addToCollection).toHaveBeenCalledWith(mockConnection, 123);
        // 5 stars + 1 wantlist button
        expect(await screen.findAllByRole("button")).toHaveLength(6);
    });

    it("shows an error message when adding to the collection fails", async () => {
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn(), updateUser: vi.fn() });
        vi.mocked(discogsAuthStorage.getConnection).mockReturnValue(mockConnection);
        vi.mocked(releaseCollectionService.addToCollection).mockRejectedValue(new Error("fail"));

        renderRateAndCollect({ releaseId: 123 });
        await userEvent.click(screen.getByRole("button", { name: /save to collection/i }));

        expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
    });

    it("rates the release when a star is clicked", async () => {
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn(), updateUser: vi.fn() });
        vi.mocked(discogsAuthStorage.getConnection).mockReturnValue(mockConnection);
        vi.mocked(releaseCollectionService.rateRelease).mockResolvedValue(undefined);

        renderRateAndCollect({ releaseId: 123, existingEntry: { instance_id: 555, rating: 0 } });
        const stars = screen.getAllByRole("button");
        await userEvent.click(stars[3]); // 4th star = rating of 4

        expect(releaseCollectionService.rateRelease).toHaveBeenCalledWith(mockConnection, 123, 555, 4);
    });

    it("shows an 'Add to Wantlist' button when not on the wantlist", () => {
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn(), updateUser: vi.fn() });
        vi.mocked(discogsAuthStorage.getConnection).mockReturnValue(mockConnection);

        renderRateAndCollect({ releaseId: 123 });
        expect(screen.getByRole("button", { name: /add to wantlist/i })).toBeInTheDocument();
    });

    it("shows a 'Remove from Wantlist' button when inWantlist is true", () => {
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn(), updateUser: vi.fn() });
        vi.mocked(discogsAuthStorage.getConnection).mockReturnValue(mockConnection);

        renderRateAndCollect({ releaseId: 123, inWantlist: true });
        expect(screen.getByRole("button", { name: /remove from wantlist/i })).toBeInTheDocument();
    });

    it("adds the release to the wantlist and flips the button label", async () => {
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn(), updateUser: vi.fn() });
        vi.mocked(discogsAuthStorage.getConnection).mockReturnValue(mockConnection);
        vi.mocked(wantlistService.addToWantlist).mockResolvedValue(undefined);

        renderRateAndCollect({ releaseId: 123 });
        await userEvent.click(screen.getByRole("button", { name: /add to wantlist/i }));

        expect(wantlistService.addToWantlist).toHaveBeenCalledWith(mockConnection, 123);
        expect(await screen.findByRole("button", { name: /remove from wantlist/i })).toBeInTheDocument();
    });

    it("removes the release from the wantlist and flips the button label", async () => {
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn(), updateUser: vi.fn() });
        vi.mocked(discogsAuthStorage.getConnection).mockReturnValue(mockConnection);
        vi.mocked(wantlistService.removeFromWantlist).mockResolvedValue(undefined);

        renderRateAndCollect({ releaseId: 123, inWantlist: true });
        await userEvent.click(screen.getByRole("button", { name: /remove from wantlist/i }));

        expect(wantlistService.removeFromWantlist).toHaveBeenCalledWith(mockConnection, 123);
        expect(await screen.findByRole("button", { name: /add to wantlist/i })).toBeInTheDocument();
    });

    it("shows an error message when updating the wantlist fails", async () => {
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn(), updateUser: vi.fn() });
        vi.mocked(discogsAuthStorage.getConnection).mockReturnValue(mockConnection);
        vi.mocked(wantlistService.addToWantlist).mockRejectedValue(new Error("fail"));

        renderRateAndCollect({ releaseId: 123 });
        await userEvent.click(screen.getByRole("button", { name: /add to wantlist/i }));

        expect(await screen.findByText(/something went wrong updating your wantlist/i)).toBeInTheDocument();
    });
});