import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../tests/server";
import ArtistPage from "./ArtistPage";
import { mockArtistProfile, mockRawArtistReleases } from "../tests/artist.mock";

const BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;

const renderWithRoute = (path: string) => {
    window.history.pushState({}, "", path);
    return render(
        <MemoryRouter initialEntries={[path]}>
            <ArtistPage />
        </MemoryRouter>
    );
};

const mockArtistEndpoints = () => {
    server.use(
        http.get(`${BASE_URL}/artists/3840`, () => HttpResponse.json(mockArtistProfile)),
        http.get(`${BASE_URL}/artists/3840/releases`, () =>
            HttpResponse.json({
                pagination: { page: 1, pages: 1, per_page: 50, items: mockRawArtistReleases.length },
                releases: mockRawArtistReleases,
            })
        )
    );
};

describe("ArtistPage", () => {
    it("loads an artist directly by id and lists their releases", async () => {
        mockArtistEndpoints();

        renderWithRoute("/artist?id=3840");

        expect(await screen.findByText("Radiohead")).toBeInTheDocument();
        expect(screen.getByText("OK Computer")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "OK Computer" })).toHaveAttribute("href", "/release/1587168");
        // "Kid A" comes back from the API as a "master" grouping entry, not
        // a concrete release — it should still show up, linked to its
        // resolved main_release id rather than being dropped.
        expect(screen.getByText("Kid A")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Kid A" })).toHaveAttribute("href", "/release/249504");
    });

    it("resolves an artist by name when only a name is given", async () => {
        server.use(
            http.get(`${BASE_URL}/database/search`, () =>
                HttpResponse.json({
                    pagination: { page: 1, pages: 1, per_page: 50, items: 1 },
                    results: [{ id: 3840, type: "artist", title: "Radiohead", thumb: "", resource_url: "" }],
                })
            )
        );
        mockArtistEndpoints();

        renderWithRoute("/artist?name=Radiohead");

        expect(await screen.findByText("Radiohead")).toBeInTheDocument();
        expect(screen.getByText("OK Computer")).toBeInTheDocument();
    });

    it("shows a message when neither id nor name is given", () => {
        renderWithRoute("/artist");
        expect(screen.getByText("No artist specified.")).toBeInTheDocument();
    });

    it("shows an error message when the name doesn't resolve to any artist", async () => {
        server.use(
            http.get(`${BASE_URL}/database/search`, () =>
                HttpResponse.json({
                    pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
                    results: [],
                })
            )
        );

        renderWithRoute("/artist?name=Nobody");

        expect(await screen.findByText(/went wrong/i)).toBeInTheDocument();
    });

    it("shows 'No releases found' when the artist has none matching", async () => {
        server.use(
            http.get(`${BASE_URL}/artists/3840`, () => HttpResponse.json(mockArtistProfile)),
            http.get(`${BASE_URL}/artists/3840/releases`, () =>
                HttpResponse.json({
                    pagination: { page: 1, pages: 1, per_page: 50, items: 0 },
                    releases: [],
                })
            )
        );

        renderWithRoute("/artist?id=3840");

        expect(await screen.findByText("No releases found.")).toBeInTheDocument();
    });

    it("fetches the next page of releases when 'Next' is clicked", async () => {
        server.use(
            http.get(`${BASE_URL}/artists/3840`, () => HttpResponse.json(mockArtistProfile)),
            http.get(`${BASE_URL}/artists/3840/releases`, ({ request }) => {
                const page = new URL(request.url).searchParams.get("page") || "1";
                return HttpResponse.json({
                    pagination: { page: Number(page), pages: 2, per_page: 50, items: 100 },
                    releases:
                        page === "2"
                            ? [{ ...mockRawArtistReleases[0], id: 42, title: "In Rainbows" }]
                            : mockRawArtistReleases,
                });
            })
        );

        renderWithRoute("/artist?id=3840");

        await screen.findByText("OK Computer");
        await userEvent.click(screen.getByRole("button", { name: /next/i }));

        expect(await screen.findByText("In Rainbows")).toBeInTheDocument();
    });
});
