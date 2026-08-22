import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../tests/server";
import BrowseCatalogPage from "./BrowseCatalogPage";
import { mockBrowseResults } from "../tests/browse.mock";

const BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;

const renderWithRoute = (path: string) => {
    window.history.pushState({}, "", path);
    return render(
        <MemoryRouter initialEntries={[path]}>
            <BrowseCatalogPage />
        </MemoryRouter>
    );
};

describe("BrowseCatalogPage", () => {
    it("loads and shows albums on mount without requiring a search query", async () => {
        server.use(
            http.get(`${BASE_URL}/database/search`, () => {
                return HttpResponse.json({
                    pagination: { page: 1, pages: 1, per_page: 50, items: mockBrowseResults.length },
                    results: mockBrowseResults,
                });
            })
        );

        renderWithRoute("/browse");

        const title = await screen.findByText("The Dark Side of the Moon");
        expect(title).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: "Title" })).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: "Artist" })).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: "Year" })).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: "Genre" })).toBeInTheDocument();
    });

    it("shows 'No albums found' when the API returns an empty array", async () => {
        server.use(
            http.get(`${BASE_URL}/database/search`, () => {
                return HttpResponse.json({
                    pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
                    results: [],
                });
            })
        );

        renderWithRoute("/browse?genre=Reggae");

        const message = await screen.findByText("No albums found.");
        expect(message).toBeInTheDocument();
    });

    it("shows a rate-limit message on a 429 response", async () => {
        server.use(
            http.get(`${BASE_URL}/database/search`, () => {
                return new HttpResponse(null, { status: 429 });
            })
        );

        renderWithRoute("/browse");

        const message = await screen.findByText(/rate limit/i);
        expect(message).toBeInTheDocument();
    });

    it("shows a server error message on a 500 response", async () => {
        server.use(
            http.get(`${BASE_URL}/database/search`, () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        renderWithRoute("/browse");

        const message = await screen.findByText(/server issues/i);
        expect(message).toBeInTheDocument();
    });

    it("does not show pagination controls when there is only one page", async () => {
        server.use(
            http.get(`${BASE_URL}/database/search`, () => {
                return HttpResponse.json({
                    pagination: { page: 1, pages: 1, per_page: 50, items: mockBrowseResults.length },
                    results: mockBrowseResults,
                });
            })
        );

        renderWithRoute("/browse");

        await screen.findByText("The Dark Side of the Moon");
        expect(screen.queryByRole("button", { name: /next/i })).not.toBeInTheDocument();
    });

    it("fetches the next page when 'Next' is clicked", async () => {
        server.use(
            http.get(`${BASE_URL}/database/search`, ({ request }) => {
                const url = new URL(request.url);
                const page = url.searchParams.get("page") || "1";
                return HttpResponse.json({
                    pagination: { page: Number(page), pages: 3, per_page: 50, items: 150 },
                    results:
                        page === "2"
                            ? [{ ...mockBrowseResults[1], title: "Radiohead - OK Computer" }]
                            : mockBrowseResults,
                });
            })
        );

        renderWithRoute("/browse");

        await screen.findByText("The Dark Side of the Moon");
        expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: /next/i }));

        await screen.findByText("OK Computer");
        expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    });
});
