import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import NavBar from "./NavBar";
import { useAuth } from "../hooks/useAuth";

vi.mock("../hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

function renderNavBar(initialPath: string) {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <NavBar />
        </MemoryRouter>
    );
}

describe("NavBar", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders search, browse catalog, and login link when no user is logged in", () => {
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn(),
            updateUser: vi.fn(),
        });

        renderNavBar("/");

        expect(screen.getByPlaceholderText("Search for an album, artist...")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /browse catalog/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
        expect(screen.queryByRole("link", { name: /profile/i })).not.toBeInTheDocument();
    });

    it("renders a profile link instead of a login link when a user is logged in", () => {
        vi.mocked(useAuth).mockReturnValue({
            user: { id: "1", username: "jdoe", email: "jdoe@example.com" },
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn(),
            updateUser: vi.fn(),
        });

        renderNavBar("/");

        expect(screen.getByRole("link", { name: /profile/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /settings/i })).toBeInTheDocument();
        expect(screen.queryByRole("link", { name: /log in/i })).not.toBeInTheDocument();
    });

    it("renders a Log Out button when a user is logged in, but not when logged out", () => {
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn(),
            updateUser: vi.fn(),
        });

        renderNavBar("/");

        expect(screen.queryByRole("button", { name: /log out/i })).not.toBeInTheDocument();
    });

    it("calls logout when the Log Out button is clicked", async () => {
        const logout = vi.fn();
        vi.mocked(useAuth).mockReturnValue({
            user: { id: "1", username: "jdoe", email: "jdoe@example.com" },
            login: vi.fn(),
            logout,
            register: vi.fn(),
            updateUser: vi.fn(),
        });

        renderNavBar("/");

        await userEvent.click(screen.getByRole("button", { name: /log out/i }));
        expect(logout).toHaveBeenCalledTimes(1);
    });

    it("does not render on the login page", () => {
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn(),
            updateUser: vi.fn(),
        });

        renderNavBar("/login");

        expect(screen.queryByPlaceholderText("Search for an album, artist...")).not.toBeInTheDocument();
    });

    it("does not render on the register page", () => {
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn(),
            updateUser: vi.fn(),
        });

        renderNavBar("/register");

        expect(screen.queryByPlaceholderText("Search for an album, artist...")).not.toBeInTheDocument();
    });
});
