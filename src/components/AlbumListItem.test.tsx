import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AlbumListItem from "./AlbumListItem";
import { mockBrowseResults } from "../tests/browse.mock";
import type { SearchResult } from "../types/search";
import { useAuth } from "../contexts/AuthContext";
import { discogsAuthStorage } from "../services/discogsAuthStorage";

vi.mock("../contexts/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../services/discogsAuthStorage", () => ({
    discogsAuthStorage: {
        getConnection: vi.fn(),
    },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}));

// Default: logged out, no Discogs connection — matches most existing
// AlbumListItem tests, which don't care about the rating feature.
beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: null, login: vi.fn(), logout: vi.fn(), register: vi.fn() });
    vi.mocked(discogsAuthStorage.getConnection).mockReturnValue(null);
    mockNavigate.mockClear();
});
const renderRow = (album: SearchResult) =>
    render(
        <table>
            <tbody>
                <AlbumListItem album={album} />
            </tbody>
        </table>
    );

describe("AlbumListItem", () => {
    it("splits 'Artist - Title' and displays title, artist, year, and genre", () => {
        renderRow(mockBrowseResults[0]);

        expect(screen.getByText("The Dark Side of the Moon")).toBeInTheDocument();
        expect(screen.getByText("Pink Floyd")).toBeInTheDocument();
        expect(screen.getByText("1973")).toBeInTheDocument();
        expect(screen.getByText("Rock")).toBeInTheDocument();
    });

    it("falls back to 'Unknown Artist' when the title has no separator", () => {
        renderRow({
            id: 999,
            title: "Untitled Compilation",
            year: "2000",
            thumb: "",
            genre: [],
            type: "release",
            resource_url: "",
        });

        expect(screen.getByText("Unknown Artist")).toBeInTheDocument();
        expect(screen.getByText("Untitled Compilation")).toBeInTheDocument();
    });

    it("renders an image when thumb is present", () => {
        renderRow(mockBrowseResults[0]);
        expect(screen.getByRole("img")).toBeInTheDocument();
    });

    it("does not render an image when thumb is an empty string", () => {
        renderRow(mockBrowseResults[1]);
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("navigates to the release page when the title is clicked", async () => {
        renderRow(mockBrowseResults[0]);

        await userEvent.click(screen.getByRole("button", { name: "The Dark Side of the Moon" }));

        expect(mockNavigate).toHaveBeenCalledWith(`/release/${mockBrowseResults[0].id}`);
    });

    it("navigates to the artist page (by name) when the artist is clicked", async () => {
        renderRow(mockBrowseResults[0]);

        await userEvent.click(screen.getByRole("button", { name: "Pink Floyd" }));

        expect(mockNavigate).toHaveBeenCalledWith("/artist?name=Pink%20Floyd");
    });

    it("does not make 'Unknown Artist' clickable", () => {
        renderRow({
            id: 999,
            title: "Untitled Compilation",
            year: "2000",
            thumb: "",
            genre: [],
            type: "release",
            resource_url: "",
        });

        expect(screen.queryByRole("button", { name: "Unknown Artist" })).not.toBeInTheDocument();
    });
});
