import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SearchResultView from "./SearchResultView";
import { mockSearchResults } from "../tests/search.mock";

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
});