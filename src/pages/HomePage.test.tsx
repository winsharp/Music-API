import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./HomePage";

const renderHomePage = () =>
    render(
        <MemoryRouter>
            <HomePage />
        </MemoryRouter>
    );

describe("HomePage", () => {
    it("renders the hero heading", () => {
        renderHomePage();

        expect(screen.getByRole("heading", { name: /discover music/i })).toBeInTheDocument();
    });

    it("renders the featured release sections with real titles and stats", async () => {
        renderHomePage();

        expect(await screen.findByText("Most Collected")).toBeInTheDocument();
        expect(screen.getByText("Most Valuable")).toBeInTheDocument();
        expect(screen.getByText("Best Selling by Week")).toBeInTheDocument();

        expect(screen.getByText("The Dark Side Of The Moon")).toBeInTheDocument();
        expect(screen.getByText("77062 collectors")).toBeInTheDocument();
    });
});
