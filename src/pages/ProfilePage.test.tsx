import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProfilePage from "./ProfilePage";
import { useAuth } from "../contexts/AuthContext";
import { useLibrary } from "../contexts/LibraryContext";
import type { RatedItem } from "../interfaces/ratedItem";
import type { UserList } from "../interfaces/userList";

vi.mock("../contexts/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../contexts/LibraryContext", () => ({
    useLibrary: vi.fn(),
}));

const mockUser = { id: "user-1", username: "jdoe", email: "jdoe@example.com" };

const mockRateItem = vi.fn();
const mockRemoveRating = vi.fn();
const mockCreateList = vi.fn();
const mockDeleteList = vi.fn();
const mockAddToList = vi.fn();
const mockRemoveFromList = vi.fn();
const mockOpenLibraryFile = vi.fn();
const mockCreateLibraryFile = vi.fn();
const mockGrantFilePermission = vi.fn();

function mockLibrary(overrides: Partial<ReturnType<typeof useLibrary>> = {}) {
    vi.mocked(useLibrary).mockReturnValue({
        ratings: [],
        lists: [],
        fileStatus: "ready",
        fileError: null,
        openLibraryFile: mockOpenLibraryFile,
        createLibraryFile: mockCreateLibraryFile,
        grantFilePermission: mockGrantFilePermission,
        getRating: vi.fn(),
        rateItem: mockRateItem,
        removeRating: mockRemoveRating,
        createList: mockCreateList,
        deleteList: mockDeleteList,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        ...overrides,
    });
}

const albumRating: RatedItem = {
    id: "release:1",
    itemType: "release",
    refId: 1,
    title: "Abbey Road",
    rating: 5,
    ratedAt: "2020-01-01",
};

const masterAlbumRating: RatedItem = {
    id: "master:1",
    itemType: "master",
    refId: 1,
    title: "Nevermind",
    rating: 4,
    ratedAt: "2020-01-01",
};

const list: UserList = {
    id: "list-1",
    name: "Favorites",
    items: [{ id: "release:1", itemType: "release", refId: 1, title: "Abbey Road" }],
    createdAt: "2020-01-01",
};

describe("ProfilePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn() });
        mockLibrary();
    });

    it("renders the logged-in user's info", () => {
        render(<ProfilePage />);

        expect(screen.getByText("jdoe")).toBeInTheDocument();
        expect(screen.getByText("jdoe@example.com")).toBeInTheDocument();
    });

    it("does not render rating sections while the library file isn't connected", () => {
        mockLibrary({ fileStatus: "disconnected" });

        render(<ProfilePage />);

        expect(screen.queryByText("Albums")).not.toBeInTheDocument();
        expect(screen.getByText("Connect a library file to save your ratings and lists.")).toBeInTheDocument();
    });

    it("shows both releases and masters as albums", () => {
        mockLibrary({ ratings: [albumRating, masterAlbumRating] });

        render(<ProfilePage />);

        expect(screen.getByText("Abbey Road")).toBeInTheDocument();
        expect(screen.getByText("Nevermind")).toBeInTheDocument();
    });

    it("shows an empty state message when there are no rated albums", () => {
        render(<ProfilePage />);

        expect(screen.getByText("No albums rated yet.")).toBeInTheDocument();
    });

    it("removes a rating when its remove button is clicked", async () => {
        mockLibrary({ ratings: [albumRating] });

        render(<ProfilePage />);

        await userEvent.click(screen.getByRole("button", { name: "Remove" }));

        expect(mockRemoveRating).toHaveBeenCalledWith("release:1");
    });

    it("creates a new list from the form", async () => {
        mockLibrary();

        render(<ProfilePage />);

        await userEvent.type(screen.getByLabelText(/new list name/i), "Road Trip");
        await userEvent.click(screen.getByRole("button", { name: /create list/i }));

        expect(mockCreateList).toHaveBeenCalledWith("Road Trip");
    });

    it("renders existing lists and their items", () => {
        mockLibrary({ lists: [list] });

        render(<ProfilePage />);

        expect(screen.getByText("Favorites")).toBeInTheDocument();
        expect(screen.getByText("Abbey Road")).toBeInTheDocument();
    });

    it("deletes a list when its delete button is clicked", async () => {
        mockLibrary({ lists: [list] });

        render(<ProfilePage />);

        await userEvent.click(screen.getByRole("button", { name: "Delete List" }));

        expect(mockDeleteList).toHaveBeenCalledWith("list-1");
    });

    it("removes an item from a list", async () => {
        mockLibrary({ lists: [list] });

        render(<ProfilePage />);

        await userEvent.click(screen.getByRole("button", { name: "Remove from list" }));

        expect(mockRemoveFromList).toHaveBeenCalledWith("list-1", "release:1");
    });
});
