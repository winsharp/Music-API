import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MyProfileRedirect from "./MyProfileRedirect";
import { useAuth } from "../contexts/AuthContext";
import { discogsAuthStorage } from "../services/discogsAuthStorage";

vi.mock("../contexts/AuthContext", () => ({
    useAuth: vi.fn(),
}));

const mockUser = { id: "user-1", username: "jdoe", email: "jdoe@example.com" };

function ProfileStub() {
    const { username } = useParams<{ username: string }>();
    return <p>Profile for {username}</p>;
}

function renderAt(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/profile" element={<MyProfileRedirect />} />
                <Route path="/profile/:username" element={<ProfileStub />} />
            </Routes>
        </MemoryRouter>
    );
}

describe("MyProfileRedirect", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), register: vi.fn(), updateUser: vi.fn() });
    });

    it("redirects to the app username when no Discogs account is linked", async () => {
        renderAt("/profile");

        expect(await screen.findByText(/Profile for jdoe/)).toBeInTheDocument();
    });

    it("redirects to the linked Discogs username when one is connected", async () => {
        discogsAuthStorage.saveConnection(mockUser.id, {
            discogsUsername: "memory",
            oauthToken: "tok",
            oauthTokenSecret: "secret",
        });

        renderAt("/profile");

        expect(await screen.findByText(/Profile for memory/)).toBeInTheDocument();
    });
});
