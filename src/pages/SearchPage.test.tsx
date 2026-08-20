import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../tests/server";
import SearchPage from "./SearchPage";
import { mockSearchResults } from "../tests/search.mock";

const BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;

const renderWithRoute = (path: string) => {
    window.history.pushState({}, "", path);
    return render(
        <MemoryRouter initialEntries={[path]}>
            <SearchPage />
        </MemoryRouter>
    );
};

describe("SearchPage", () => {
    it("shows results once data loads", async () => {
        renderWithRoute("/search?q=nirvana");

        const title = await screen.findByText(mockSearchResults[0].title);
        expect(title).toBeInTheDocument();
    });

    it("shows 'No results found' when the API returns an empty array", async () => {
        server.use(
            http.get(`${BASE_URL}/database/search`, () => {
                return HttpResponse.json({
                    pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
                    results: [],
                });
            })
        );

        renderWithRoute("/search?q=asdkjfhaskjdfh");

        const message = await screen.findByText("No results found.");
        expect(message).toBeInTheDocument();
    });

    it("shows a rate-limit message on a 429 response", async () => {
        server.use(
            http.get(`${BASE_URL}/database/search`, () => {
                return new HttpResponse(null, { status: 429 });
            })
        );

        renderWithRoute("/search?q=nirvana");

        const message = await screen.findByText(/rate limit/i);
        expect(message).toBeInTheDocument();
    });

    it("shows a server error message on a 500 response", async () => {
        server.use(
            http.get(`${BASE_URL}/database/search`, () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        renderWithRoute("/search?q=nirvana");

        const message = await screen.findByText(/server issues/i);
        expect(message).toBeInTheDocument();
    });
});