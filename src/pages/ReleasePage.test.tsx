import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../tests/server";
import ReleasePage from "./ReleasePage";
import { mockReleaseDetail } from "../tests/release.mock";

const BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;

const renderWithRoute = (path: string) => {
    window.history.pushState({}, "", path);
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/release/:id" element={<ReleasePage />} />
            </Routes>
        </MemoryRouter>
    );
};

describe("ReleasePage", () => {
    it("shows title, artist, year, genre, and the tracklist", async () => {
        server.use(
            http.get(`${BASE_URL}/releases/1587168`, () => {
                return HttpResponse.json(mockReleaseDetail);
            })
        );

        renderWithRoute("/release/1587168");

        expect(await screen.findByText("OK Computer")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Radiohead" })).toHaveAttribute("href", "/artist?id=3840");
        expect(screen.getByText(/release year:\s*1997/i)).toBeInTheDocument();
        expect(screen.getByText(/genre:\s*rock/i)).toBeInTheDocument();
        expect(screen.getByText("Airbag (4:44)")).toBeInTheDocument();
        expect(screen.getByText("Paranoid Android (6:23)")).toBeInTheDocument();
    });

    it("excludes non-track rows (e.g. side headings) from the tracklist", async () => {
        server.use(
            http.get(`${BASE_URL}/releases/1587168`, () => {
                return HttpResponse.json(mockReleaseDetail);
            })
        );

        renderWithRoute("/release/1587168");

        await screen.findByText("OK Computer");
        expect(screen.queryByText("Side A")).not.toBeInTheDocument();
    });

    it("shows a not-found message for an unknown release id", async () => {
        server.use(
            http.get(`${BASE_URL}/releases/999999999`, () => {
                return new HttpResponse(null, { status: 404 });
            })
        );

        renderWithRoute("/release/999999999");

        expect(await screen.findByText(/couldn't be found/i)).toBeInTheDocument();
    });
});
