import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import GuestRoute from "./GuestRoute";
import { useAuth } from "../hooks/useAuth";

vi.mock("../hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

function renderGuestRoute() {
    return render(
        <MemoryRouter initialEntries={["/login"]}>
            <Routes>
                <Route path="/" element={<div>Home Page</div>} />
                <Route
                    path="/login"
                    element={
                        <GuestRoute>
                            <div>Login Form</div>
                        </GuestRoute>
                    }
                />
            </Routes>
        </MemoryRouter>
    );
}

describe("GuestRoute", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("redirects to / when there is an authenticated user", () => {
        vi.mocked(useAuth).mockReturnValue({
            user: { id: "1", username: "jdoe", email: "jdoe@example.com" },
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn(),
            updateUser: vi.fn(),
        });

        renderGuestRoute();

        expect(screen.getByText("Home Page")).toBeInTheDocument();
        expect(screen.queryByText("Login Form")).not.toBeInTheDocument();
    });

    it("renders the guest content when there is no authenticated user", () => {
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn(),
            updateUser: vi.fn(),
        });

        renderGuestRoute();

        expect(screen.getByText("Login Form")).toBeInTheDocument();
        expect(screen.queryByText("Home Page")).not.toBeInTheDocument();
    });
});
