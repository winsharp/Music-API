import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProfilePage from "./ProfilePage";
import { discogsUserService } from "../services/discogsUserService";
import { useAuth } from "../contexts/AuthContext";
import type { DiscogsUserProfile, CollectionRelease } from "../types/discogsUser";

vi.mock("../services/discogsUserService", () => ({
    discogsUserService: {
        getProfile: vi.fn(),
        getCollection: vi.fn(),
    },
}));

vi.mock("../contexts/AuthContext", () => ({
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
    basic_information: { id: 1, title: "Abbey Road", thumb: "thumb.jpg", year: 1969 },
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
        vi.mocked(useAuth).mockReturnValue({
            user: mockAppUser,
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn(),
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

        await waitFor(() => expect(screen.getByText("Abbey Road")).toBeInTheDocument());
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
});
