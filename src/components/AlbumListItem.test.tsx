import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AlbumListItem from "./AlbumListItem";
import { mockBrowseResults } from "../tests/browse.mock";
import type { SearchResult } from "../types/search";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}));

beforeEach(() => {
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
        // "Pink Floyd" appears twice: once in the mobile-only summary line
        // and once in the desktop-only column (both rendered in the DOM;
        // only one is visible at a time via responsive CSS classes).
        expect(screen.getAllByText("Pink Floyd").length).toBeGreaterThan(0);
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

        // Rendered in both the mobile summary line and the desktop column.
        expect(screen.getAllByText("Unknown Artist").length).toBeGreaterThan(0);
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

        // Two "Pink Floyd" buttons exist (mobile summary + desktop column);
        // both call the same click handler, so clicking either is valid.
        await userEvent.click(screen.getAllByRole("button", { name: "Pink Floyd" })[0]);

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
