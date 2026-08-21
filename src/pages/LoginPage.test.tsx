import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import { useAuth } from "../contexts/AuthContext";

vi.mock("../contexts/AuthContext", () => ({
    useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    return { ...actual, useNavigate: () => mockNavigate };
});

const mockLogin = vi.fn();

function renderLoginPage(initialEntries: Array<string | { pathname: string; state?: unknown }> = ["/login"]) {
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </MemoryRouter>
    );
}

describe("LoginPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            login: mockLogin,
            logout: vi.fn(),
            register: vi.fn(),
        });
    });

    it("renders the username and password fields", () => {
        renderLoginPage();

        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    });

    it("logs in and navigates to '/' on success", async () => {
        mockLogin.mockResolvedValue(undefined);
        renderLoginPage();

        await userEvent.type(screen.getByLabelText(/username/i), "jdoe");
        await userEvent.type(screen.getByLabelText(/password/i), "hunter2");
        await userEvent.click(screen.getByRole("button", { name: /log in/i }));

        expect(mockLogin).toHaveBeenCalledWith("jdoe", "hunter2");
        expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });

    it("redirects back to the page the user came from after login", async () => {
        mockLogin.mockResolvedValue(undefined);
        renderLoginPage([{ pathname: "/login", state: { from: "/search" } }]);

        await userEvent.type(screen.getByLabelText(/username/i), "jdoe");
        await userEvent.type(screen.getByLabelText(/password/i), "hunter2");
        await userEvent.click(screen.getByRole("button", { name: /log in/i }));

        expect(mockNavigate).toHaveBeenCalledWith("/search", { replace: true });
    });

    it("shows an error message when login fails", async () => {
        mockLogin.mockRejectedValue(new Error("Invalid username or password."));
        renderLoginPage();

        await userEvent.type(screen.getByLabelText(/username/i), "jdoe");
        await userEvent.type(screen.getByLabelText(/password/i), "wrong");
        await userEvent.click(screen.getByRole("button", { name: /log in/i }));

        expect(await screen.findByRole("alert")).toHaveTextContent("Invalid username or password.");
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
