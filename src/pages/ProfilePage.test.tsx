import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProfilePage from "./ProfilePage";
import { discogsUserService } from "../services/discogsUserService";
import { clearCache } from "../services/discogsUserCache";
import { useAuth } from "../hooks/useAuth";
import { discogsAuthStorage } from "../services/discogsAuthStorage";
import type { DiscogsUserProfile, CollectionRelease, DiscogsListDetail, WantlistItem } from "../types/discogsUser";

vi.mock("../services/discogsUserService", () => ({
    discogsUserService: {
        getProfile: vi.fn(),
        getCollection: vi.fn(),
        getLists: vi.fn(),
        getListDetail: vi.fn(),
        getWantlist: vi.fn(),
    },
}));

vi.mock("../hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

const mockAppUser = { id: "user-1", username: "jdoe", email: "jdoe@example.com" };

const mockProfile: DiscogsUserProfile = {
    username: "memory",
    profile: "",
    avatar_url: "https://example.com/avatar.jpg",
    location: "Portland, OR",
    num_collection: 12,
    num_wantlist: 3,
    num_lists: 1,
    releases_rated: 2,
    rating_avg: 4.5,
};

const collectionItem: CollectionRelease = {
    id: 1,
    instance_id: 100,
    rating: 4,
    date_added: "2024-01-01T00:00:00Z",
    basic_information: { id: 1, title: "Abbey Road", thumb: "thumb.jpg", year: 1969 },
};

const unratedCollectionItem: CollectionRelease = {
    id: 2,
    instance_id: 101,
    rating: 0,
    date_added: "2024-06-01T00:00:00Z",
    basic_information: { id: 2, title: "Nevermind", thumb: "thumb2.jpg", year: 1991 },
};

const listDetail: DiscogsListDetail = {
    id: 10,
    name: "Best Jazz Albums",
    description: "My personal favorites.",
    public: true,
    items: [{ id: 1, type: "release", display_title: "Miles Davis — Kind Of Blue" }],
};

const wantlistItem: WantlistItem = {
    id: 3,
    rating: 0,
    date_added: "2024-03-01T00:00:00Z",
    basic_information: { id: 3, title: "OK Computer", thumb: "thumb3.jpg", year: 1997 },
};

function renderWithRoute(username: string) {
    return render(
        <MemoryRouter initialEntries={[`/profile/${username}`]}>
            <Routes>
                <Route path="/profile/:username" element={<ProfilePage />} />
            </Routes>
        </MemoryRouter>
    );
}

describe("ProfilePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        clearCache();
        vi.mocked(useAuth).mockReturnValue({
            user: mockAppUser,
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn(),
            updateUser: vi.fn(),
        });
        vi.mocked(discogsUserService.getLists).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
            lists: [],
        });
        vi.mocked(discogsUserService.getWantlist).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
            wants: [],
        });
    });

    it("renders a Discogs user's profile info", async () => {
        vi.mocked(discogsUserService.getProfile).mockResolvedValue(mockProfile);
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
            releases: [],
        });

        renderWithRoute("memory");

        await waitFor(() => expect(screen.getByText("memory")).toBeInTheDocument());
        expect(screen.getByText("Portland, OR")).toBeInTheDocument();
        expect(discogsUserService.getProfile).toHaveBeenCalledWith("memory");
        expect(discogsUserService.getCollection).toHaveBeenCalledWith("memory", null);
    });

    it("shows an empty state when the collection has no releases", async () => {
        vi.mocked(discogsUserService.getProfile).mockResolvedValue(mockProfile);
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
            releases: [],
        });

        renderWithRoute("memory");

        await waitFor(() =>
            expect(screen.getByText("This user hasn't added any releases to their collection yet.")).toBeInTheDocument()
        );
    });

    it("renders collection releases with their Discogs rating", async () => {
        vi.mocked(discogsUserService.getProfile).mockResolvedValue(mockProfile);
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 1 },
            releases: [collectionItem],
        });

        renderWithRoute("memory");

        // Rated items show up under both "Recently Rated" and "Collection".
        await waitFor(() => expect(screen.getAllByText("Abbey Road").length).toBeGreaterThan(0));
    });

    it("shows recently rated albums, excluding unrated collection items", async () => {
        vi.mocked(discogsUserService.getProfile).mockResolvedValue(mockProfile);
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 2 },
            releases: [collectionItem, unratedCollectionItem],
        });

        renderWithRoute("memory");

        await waitFor(() => expect(screen.getByText("Recently Rated")).toBeInTheDocument());
        expect(screen.getAllByText("Abbey Road")).not.toHaveLength(0);
        // Nevermind has no rating, so it shouldn't show up under Recently Rated
        // (it still appears once under the full Collection list below).
        expect(screen.getAllByText("Nevermind")).toHaveLength(1);
    });

    it("doesn't show a Recently Rated section when nothing has been rated", async () => {
        vi.mocked(discogsUserService.getProfile).mockResolvedValue(mockProfile);
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 1 },
            releases: [unratedCollectionItem],
        });

        renderWithRoute("memory");

        await waitFor(() => expect(screen.getByText("Nevermind")).toBeInTheDocument());
        expect(screen.queryByText("Recently Rated")).not.toBeInTheDocument();
    });

    it("shows an error message when the user can't be found", async () => {
        vi.mocked(discogsUserService.getProfile).mockRejectedValue({
            isAxiosError: true,
            response: { status: 404 },
        });
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
            releases: [],
        });

        const axiosModule = await import("axios");
        vi.spyOn(axiosModule.default, "isAxiosError").mockReturnValue(true);

        renderWithRoute("nobody");

        await waitFor(() => expect(screen.getByText('No Discogs user found for "nobody".')).toBeInTheDocument());
    });

    it("offers to connect Discogs when the logged-in user's own username doesn't match a Discogs account", async () => {
        vi.mocked(discogsUserService.getProfile).mockRejectedValue({
            isAxiosError: true,
            response: { status: 404 },
        });
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
            releases: [],
        });

        const axiosModule = await import("axios");
        vi.spyOn(axiosModule.default, "isAxiosError").mockReturnValue(true);

        // mockAppUser.username is "jdoe" — viewing that same username with no
        // linked Discogs connection should offer to connect instead of a
        // dead-end error.
        renderWithRoute("jdoe");

        await waitFor(() =>
            expect(screen.getByText(/We couldn't find a Discogs account matching your username/)).toBeInTheDocument()
        );
        expect(screen.getByRole("button", { name: "Connect Discogs Account" })).toBeInTheDocument();
    });

    it("shows the app's localStorage username alongside a connected Discogs profile", async () => {
        discogsAuthStorage.saveConnection(mockAppUser.id, {
            discogsUsername: "memory",
            oauthToken: "token",
            oauthTokenSecret: "secret",
        });
        vi.mocked(discogsUserService.getProfile).mockResolvedValue(mockProfile);
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
            releases: [],
        });

        renderWithRoute("memory");

        await waitFor(() => expect(screen.getByText("memory")).toBeInTheDocument());
        expect(screen.getByText(`Logged in as ${mockAppUser.username}`)).toBeInTheDocument();
    });

    it("still shows profile info and a private-collection message when the collection can't be read", async () => {
        vi.mocked(discogsUserService.getProfile).mockResolvedValue(mockProfile);
        vi.mocked(discogsUserService.getCollection).mockRejectedValue({
            isAxiosError: true,
            response: { status: 401 },
        });

        const axiosModule = await import("axios");
        vi.spyOn(axiosModule.default, "isAxiosError").mockReturnValue(true);

        renderWithRoute("memory");

        await waitFor(() => expect(screen.getByText("memory")).toBeInTheDocument());
        expect(screen.getByText("memory's collection is private.")).toBeInTheDocument();
    });

    it("shows an empty state when the user has no lists", async () => {
        vi.mocked(discogsUserService.getProfile).mockResolvedValue(mockProfile);
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
            releases: [],
        });

        renderWithRoute("memory");

        await waitFor(() =>
            expect(screen.getByText("This user hasn't created any lists yet.")).toBeInTheDocument()
        );
    });

    it("renders a user's lists with their items", async () => {
        vi.mocked(discogsUserService.getProfile).mockResolvedValue(mockProfile);
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
            releases: [],
        });
        vi.mocked(discogsUserService.getLists).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 1 },
            lists: [{ id: listDetail.id, name: listDetail.name, description: listDetail.description, public: true }],
        });
        vi.mocked(discogsUserService.getListDetail).mockResolvedValue(listDetail);

        renderWithRoute("memory");

        await waitFor(() => expect(screen.getByText("Best Jazz Albums")).toBeInTheDocument());
        expect(screen.getByText("Miles Davis — Kind Of Blue")).toBeInTheDocument();
        expect(discogsUserService.getListDetail).toHaveBeenCalledWith(listDetail.id, null);
    });

    it("overrides another user's collection with a matching mock profile's rated releases", async () => {
        vi.mocked(discogsUserService.getProfile).mockResolvedValue({ ...mockProfile, username: "jazzhead92" });
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 1 },
            releases: [collectionItem],
        });

        renderWithRoute("jazzhead92");

        await waitFor(() => expect(screen.getAllByText("OK Computer").length).toBeGreaterThan(0));
        expect(screen.queryByText("Abbey Road")).not.toBeInTheDocument();
    });

    it("synthesizes a profile from mock data when the mock username has no real Discogs account", async () => {
        vi.mocked(discogsUserService.getProfile).mockRejectedValue({
            isAxiosError: true,
            response: { status: 404 },
        });

        const axiosModule = await import("axios");
        vi.spyOn(axiosModule.default, "isAxiosError").mockReturnValue(true);

        renderWithRoute("jazzhead92");

        await waitFor(() => expect(screen.getByText("jazzhead92")).toBeInTheDocument());
        expect(screen.getAllByText("OK Computer").length).toBeGreaterThan(0);
        expect(screen.queryByText(/No Discogs user found/)).not.toBeInTheDocument();
    });

    it("still shows the real 404 error for an unknown username with no matching mock profile", async () => {
        vi.mocked(discogsUserService.getProfile).mockRejectedValue({
            isAxiosError: true,
            response: { status: 404 },
        });
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
            releases: [],
        });

        const axiosModule = await import("axios");
        vi.spyOn(axiosModule.default, "isAxiosError").mockReturnValue(true);

        renderWithRoute("totally-unknown-user");

        await waitFor(() =>
            expect(screen.getByText('No Discogs user found for "totally-unknown-user".')).toBeInTheDocument()
        );
    });

    it("doesn't override the logged-in user's own profile collection, even with a matching mock username", async () => {
        vi.mocked(discogsUserService.getProfile).mockResolvedValue({ ...mockProfile, username: "jazzhead92" });
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 1 },
            releases: [collectionItem],
        });
        vi.mocked(useAuth).mockReturnValue({
            user: { ...mockAppUser, username: "jazzhead92" },
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn(),
            updateUser: vi.fn(),
        });

        renderWithRoute("jazzhead92");

        await waitFor(() => expect(screen.getAllByText("Abbey Road").length).toBeGreaterThan(0));
        expect(screen.queryByText("OK Computer")).not.toBeInTheDocument();
    });

    it("shows a private-lists message when the user's lists can't be read", async () => {
        vi.mocked(discogsUserService.getProfile).mockResolvedValue(mockProfile);
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
            releases: [],
        });
        vi.mocked(discogsUserService.getLists).mockRejectedValue({
            isAxiosError: true,
            response: { status: 401 },
        });

        const axiosModule = await import("axios");
        vi.spyOn(axiosModule.default, "isAxiosError").mockReturnValue(true);

        renderWithRoute("memory");

        await waitFor(() => expect(screen.getByText("memory's lists are private.")).toBeInTheDocument());
    });

    it("shows an empty state when the user's wantlist is empty", async () => {
        vi.mocked(discogsUserService.getProfile).mockResolvedValue(mockProfile);
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
            releases: [],
        });

        renderWithRoute("memory");

        await waitFor(() =>
            expect(screen.getByText("This user hasn't added anything to their wantlist yet.")).toBeInTheDocument()
        );
    });

    it("renders a user's wantlist items", async () => {
        vi.mocked(discogsUserService.getProfile).mockResolvedValue(mockProfile);
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
            releases: [],
        });
        vi.mocked(discogsUserService.getWantlist).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 1 },
            wants: [wantlistItem],
        });

        renderWithRoute("memory");

        await waitFor(() => expect(screen.getByText("OK Computer")).toBeInTheDocument());
        expect(discogsUserService.getWantlist).toHaveBeenCalledWith("memory", null);
    });

    it("shows a private-wantlist message when the user's wantlist can't be read", async () => {
        vi.mocked(discogsUserService.getProfile).mockResolvedValue(mockProfile);
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
            releases: [],
        });
        vi.mocked(discogsUserService.getWantlist).mockRejectedValue({
            isAxiosError: true,
            response: { status: 401 },
        });

        const axiosModule = await import("axios");
        vi.spyOn(axiosModule.default, "isAxiosError").mockReturnValue(true);

        renderWithRoute("memory");

        await waitFor(() => expect(screen.getByText("memory's wantlist is private.")).toBeInTheDocument());
    });

    it("doesn't show the Connect Discogs option on another user's profile", async () => {
        vi.mocked(discogsUserService.getProfile).mockResolvedValue(mockProfile);
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
            releases: [],
        });

        renderWithRoute("memory");

        await waitFor(() => expect(screen.getByText("memory")).toBeInTheDocument());
        expect(screen.queryByText("Connect Discogs Account")).not.toBeInTheDocument();
        expect(screen.queryByText(/Connected to Discogs as/)).not.toBeInTheDocument();
    });

    it("shows the Connect Discogs option on your own profile (app username fallback)", async () => {
        vi.mocked(discogsUserService.getProfile).mockResolvedValue({ ...mockProfile, username: "jdoe" });
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
            releases: [],
        });

        renderWithRoute("jdoe");

        await waitFor(() => expect(screen.getByText("jdoe")).toBeInTheDocument());
        expect(screen.getByText("Connect Discogs Account")).toBeInTheDocument();
    });

    it("shows the Connect Discogs option on your own profile (linked Discogs username)", async () => {
        discogsAuthStorage.saveConnection("user-1", {
            discogsUsername: "memory",
            oauthToken: "token",
            oauthTokenSecret: "secret",
        });
        vi.mocked(discogsUserService.getProfile).mockResolvedValue(mockProfile);
        vi.mocked(discogsUserService.getCollection).mockResolvedValue({
            pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
            releases: [],
        });

        renderWithRoute("memory");

        await waitFor(() => expect(screen.getByText("memory")).toBeInTheDocument());
        expect(screen.getByText(/Connected to Discogs as memory/)).toBeInTheDocument();
    });
});
