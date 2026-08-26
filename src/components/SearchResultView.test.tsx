import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SearchResultView from "./SearchResultView";
import { mockSearchResults } from "../tests/search.mock";
import { mockBrowseResults } from "../tests/browse.mock";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}));

beforeEach(() => {
    mockNavigate.mockClear();
});

//groups related tests together
describe("SearchResultView", () => {
    //single test for title,year,genre
    it("renders the title, year, and genre for a result", () => {
        const result = mockSearchResults[0]; // has a thumb, genre, etc.
        //RTL function that adds the component to a fake server,
        render(<SearchResultView result={result} />);
        //assertion like JUnit. Searches and verifies that the code result matches the tests expectation
        expect(screen.getByText("The Dark Side of the Moon")).toBeInTheDocument();
        expect(screen.getByText("1973")).toBeInTheDocument();
        expect(screen.getByText("Rock")).toBeInTheDocument();
    });

    it("renders an image when thumb is present", () => {
        const result = mockSearchResults[0];
        render(<SearchResultView result={result} />);

        //getBy throws an error if element isn't found
        const image = screen.getByRole("img");
        expect(image).toBeInTheDocument();
    });
    //tests empty image error
    it("does not render an image when thumb is an empty string", () => {
        const result = mockSearchResults[1]; // this one has thumb: ''
        render(<SearchResultView result={result} />);
        //queryBy returns null instead of throwing. Used if image doesn't exist good for empty-image
        const image = screen.queryByRole("img");
        expect(image).not.toBeInTheDocument();
    });

    it("navigates to the release page when the title is clicked", async () => {
        const result = mockSearchResults[0];
        render(<SearchResultView result={result} />);

        await userEvent.click(screen.getByRole("button", { name: "The Dark Side of the Moon" }));

        expect(mockNavigate).toHaveBeenCalledWith(`/release/${result.id}`);
    });

    it("navigates to the artist page (by name) when the artist is clicked", async () => {
        const result = mockBrowseResults[0]; // title is "Pink Floyd - The Dark Side of the Moon"
        render(<SearchResultView result={result} />);

        await userEvent.click(screen.getByRole("button", { name: "Pink Floyd" }));

        expect(mockNavigate).toHaveBeenCalledWith("/artist?name=Pink%20Floyd");
    });

    it("does not make 'Unknown Artist' clickable when the title has no separator", () => {
        const result = mockSearchResults[0]; // title has no "Artist - Title" separator
        render(<SearchResultView result={result} />);

        expect(screen.getByText("Unknown Artist")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Unknown Artist" })).not.toBeInTheDocument();
    });
});
