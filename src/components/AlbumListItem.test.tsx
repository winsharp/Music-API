import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AlbumListItem from "./AlbumListItem";
import { mockBrowseResults } from "../tests/browse.mock";
import type { SearchResult } from "../types/search";

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
});
