import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AlbumListItem from "./AlbumListItem";
import { mockBrowseResults } from "../tests/browse.mock";

describe("AlbumListItem", () => {
    it("splits 'Artist - Title' and displays title, artist, year, and genre", () => {
        render(<AlbumListItem album={mockBrowseResults[0]} />);

        expect(screen.getByText("The Dark Side of the Moon")).toBeInTheDocument();
        expect(screen.getByText("Pink Floyd")).toBeInTheDocument();
        expect(screen.getByText("1973")).toBeInTheDocument();
        expect(screen.getByText("Rock")).toBeInTheDocument();
    });

    it("falls back to 'Unknown Artist' when the title has no separator", () => {
        render(
            <AlbumListItem
                album={{
                    id: 999,
                    title: "Untitled Compilation",
                    year: "2000",
                    thumb: "",
                    genre: [],
                    type: "release",
                    resource_url: "",
                }}
            />
        );

        expect(screen.getByText("Unknown Artist")).toBeInTheDocument();
        expect(screen.getByText("Untitled Compilation")).toBeInTheDocument();
    });

    it("renders an image when thumb is present", () => {
        render(<AlbumListItem album={mockBrowseResults[0]} />);
        expect(screen.getByRole("img")).toBeInTheDocument();
    });

    it("does not render an image when thumb is an empty string", () => {
        render(<AlbumListItem album={mockBrowseResults[1]} />);
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
});
