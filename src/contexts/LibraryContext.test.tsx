import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { LibraryProvider, useLibrary } from "./LibraryContext";
import { useAuth } from "./AuthContext";
import { libraryService } from "../services/libraryService";
import {
    isFileSystemAccessSupported,
    tryReconnect,
    openLibraryFile,
    createLibraryFile,
} from "../services/libraryFileStore";

vi.mock("./AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../services/libraryService", () => ({
    libraryService: {
        getRatings: vi.fn(),
        getLists: vi.fn(),
        rateItem: vi.fn(),
        removeRating: vi.fn(),
        createList: vi.fn(),
        deleteList: vi.fn(),
        addToList: vi.fn(),
        removeFromList: vi.fn(),
    },
}));

vi.mock("../services/libraryFileStore", () => ({
    isFileSystemAccessSupported: vi.fn(),
    tryReconnect: vi.fn(),
    reconnectWithPermissionPrompt: vi.fn(),
    openLibraryFile: vi.fn(),
    createLibraryFile: vi.fn(),
}));

const mockUser = { id: "user-1", username: "jdoe", email: "jdoe@example.com" };
const wrapper = ({ children }: { children: ReactNode }) => <LibraryProvider>{children}</LibraryProvider>;

function mockLoggedOut() {
    vi.mocked(useAuth).mockReturnValue({ user: null, login: vi.fn(), logout: vi.fn(), register: vi.fn() });
}

function mockLoggedIn() {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn() });
}

describe("LibraryContext", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLoggedOut();
        vi.mocked(isFileSystemAccessSupported).mockReturnValue(true);
        vi.mocked(tryReconnect).mockResolvedValue("none");
        vi.mocked(libraryService.getRatings).mockResolvedValue([]);
        vi.mocked(libraryService.getLists).mockResolvedValue([]);
    });

    it("throws when useLibrary is used outside of a LibraryProvider", () => {
        expect(() => renderHook(() => useLibrary())).toThrow(
            "useLibrary must be used within a LibraryProvider"
        );
    });

    it("marks the file as unsupported when the browser lacks File System Access", async () => {
        vi.mocked(isFileSystemAccessSupported).mockReturnValue(false);

        const { result } = renderHook(() => useLibrary(), { wrapper });

        await waitFor(() => expect(result.current.fileStatus).toBe("unsupported"));
    });

    it("stays disconnected when no file has been connected before", async () => {
        const { result } = renderHook(() => useLibrary(), { wrapper });

        await waitFor(() => expect(result.current.fileStatus).toBe("disconnected"));
    });

    it("resumes a previously connected file silently", async () => {
        vi.mocked(tryReconnect).mockResolvedValue("connected");

        const { result } = renderHook(() => useLibrary(), { wrapper });

        await waitFor(() => expect(result.current.fileStatus).toBe("ready"));
    });

    it("flags that permission needs to be re-granted", async () => {
        vi.mocked(tryReconnect).mockResolvedValue("needs-permission");

        const { result } = renderHook(() => useLibrary(), { wrapper });

        await waitFor(() => expect(result.current.fileStatus).toBe("needs-permission"));
    });

    it("loads ratings and lists once the file is ready and a user is logged in", async () => {
        vi.mocked(tryReconnect).mockResolvedValue("connected");
        mockLoggedIn();
        const ratings = [
            { id: "release:1", itemType: "release" as const, refId: 1, title: "Abbey Road", rating: 5, ratedAt: "2020-01-01" },
        ];
        vi.mocked(libraryService.getRatings).mockResolvedValue(ratings);

        const { result } = renderHook(() => useLibrary(), { wrapper });

        await waitFor(() => expect(result.current.ratings).toEqual(ratings));
        expect(libraryService.getRatings).toHaveBeenCalledWith(mockUser.id);
    });

    it("clears ratings and lists when there is no logged-in user", async () => {
        const { result } = renderHook(() => useLibrary(), { wrapper });

        await waitFor(() => expect(result.current.fileStatus).toBe("disconnected"));
        expect(result.current.ratings).toEqual([]);
        expect(result.current.lists).toEqual([]);
    });

    it("rates an item and updates state", async () => {
        vi.mocked(tryReconnect).mockResolvedValue("connected");
        mockLoggedIn();
        const newRating = {
            id: "release:1",
            itemType: "release" as const,
            refId: 1,
            title: "Abbey Road",
            rating: 5,
            ratedAt: "2020-01-01",
        };
        vi.mocked(libraryService.rateItem).mockResolvedValue([newRating]);

        const { result } = renderHook(() => useLibrary(), { wrapper });
        await waitFor(() => expect(result.current.fileStatus).toBe("ready"));

        await act(async () => {
            await result.current.rateItem(
                { id: "release:1", itemType: "release", refId: 1, title: "Abbey Road" },
                5
            );
        });

        expect(libraryService.rateItem).toHaveBeenCalledWith(
            mockUser.id,
            { id: "release:1", itemType: "release", refId: 1, title: "Abbey Road" },
            5
        );
        expect(result.current.ratings).toEqual([newRating]);
    });

    it("connects to a new library file via createLibraryFile", async () => {
        vi.mocked(createLibraryFile).mockResolvedValue(undefined);

        const { result } = renderHook(() => useLibrary(), { wrapper });
        await waitFor(() => expect(result.current.fileStatus).toBe("disconnected"));

        await act(async () => {
            await result.current.createLibraryFile();
        });

        expect(createLibraryFile).toHaveBeenCalled();
        expect(result.current.fileStatus).toBe("ready");
    });

    it("surfaces an error when connecting to a file fails", async () => {
        vi.mocked(openLibraryFile).mockRejectedValue(new Error("Permission denied"));

        const { result } = renderHook(() => useLibrary(), { wrapper });
        await waitFor(() => expect(result.current.fileStatus).toBe("disconnected"));

        await act(async () => {
            await result.current.openLibraryFile();
        });

        expect(result.current.fileStatus).toBe("error");
        expect(result.current.fileError).toBe("Permission denied");
    });

    it("getRating finds a rating by refId and itemType", async () => {
        vi.mocked(tryReconnect).mockResolvedValue("connected");
        mockLoggedIn();
        const rating = {
            id: "release:1",
            itemType: "release" as const,
            refId: 1,
            title: "Abbey Road",
            rating: 5,
            ratedAt: "2020-01-01",
        };
        vi.mocked(libraryService.getRatings).mockResolvedValue([rating]);

        const { result } = renderHook(() => useLibrary(), { wrapper });
        await waitFor(() => expect(result.current.ratings).toEqual([rating]));

        expect(result.current.getRating(1, "release")).toEqual(rating);
        expect(result.current.getRating(999, "release")).toBeUndefined();
    });
});
