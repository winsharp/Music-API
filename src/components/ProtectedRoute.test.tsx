import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../hooks/useAuth";

vi.mock("../hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

function renderProtectedRoute() {
    return render(
        <MemoryRouter initialEntries={["/protected"]}>
            <Routes>
                <Route path="/login" element={<div>Login Page</div>} />
                <Route
                    path="/protected"
                    element={
                        <ProtectedRoute>
                            <div>Secret Content</div>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </MemoryRouter>
    );
}

describe("ProtectedRoute", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("redirects to /login when there is no authenticated user", () => {
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn(),
            updateUser: vi.fn(),
        });

        renderProtectedRoute();

        expect(screen.getByText("Login Page")).toBeInTheDocument();
        expect(screen.queryByText("Secret Content")).not.toBeInTheDocument();
    });

    it("renders the protected content when a user is authenticated", () => {
        vi.mocked(useAuth).mockReturnValue({
            user: { id: "1", username: "jdoe", email: "jdoe@example.com" },
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn(),
            updateUser: vi.fn(),
        });

        renderProtectedRoute();

        expect(screen.getByText("Secret Content")).toBeInTheDocument();
        expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
    });
});
