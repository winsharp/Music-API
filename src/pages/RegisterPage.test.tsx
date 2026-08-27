import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./RegisterPage";
import { useAuth } from "../contexts/AuthContext";

vi.mock("../contexts/AuthContext", () => ({
    useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    return { ...actual, useNavigate: () => mockNavigate };
});

const mockRegister = vi.fn();

function renderRegisterPage() {
    return render(
        <MemoryRouter initialEntries={["/register"]}>
            <Routes>
                <Route path="/register" element={<RegisterPage />} />
            </Routes>
        </MemoryRouter>
    );
}

async function fillForm({
    username = "jdoe",
    email = "jdoe@example.com",
    password = "hunter2",
    confirmPassword = password,
}: { username?: string; email?: string; password?: string; confirmPassword?: string } = {}) {
    await userEvent.type(screen.getByLabelText(/^username$/i), username);
    await userEvent.type(screen.getByLabelText(/^email$/i), email);
    await userEvent.type(screen.getByLabelText(/^password$/i), password);
    await userEvent.type(screen.getByLabelText(/confirm password/i), confirmPassword);
}

describe("RegisterPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            login: vi.fn(),
            logout: vi.fn(),
            register: mockRegister,
            updateUser: vi.fn(),
        });
    });

    it("renders all the registration fields", () => {
        renderRegisterPage();

        expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
    });

    it("shows an error and does not call register when passwords do not match", async () => {
        renderRegisterPage();

        await fillForm({ confirmPassword: "different" });
        await userEvent.click(screen.getByRole("button", { name: /register/i }));

        expect(await screen.findByRole("alert")).toHaveTextContent("Passwords do not match.");
        expect(mockRegister).not.toHaveBeenCalled();
    });

    it("registers and navigates to '/' on success", async () => {
        mockRegister.mockResolvedValue(undefined);
        renderRegisterPage();

        await fillForm();
        await userEvent.click(screen.getByRole("button", { name: /register/i }));

        expect(mockRegister).toHaveBeenCalledWith(
            { username: "jdoe", email: "jdoe@example.com" },
            "hunter2"
        );
        expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });

    it("shows an error message when registration fails", async () => {
        mockRegister.mockRejectedValue(new Error("Username is already taken."));
        renderRegisterPage();

        await fillForm();
        await userEvent.click(screen.getByRole("button", { name: /register/i }));

        expect(await screen.findByRole("alert")).toHaveTextContent("Username is already taken.");
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
