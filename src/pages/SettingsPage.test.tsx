import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import SettingsPage from "./SettingsPage";
import { useAuth } from "../hooks/useAuth";

vi.mock("../hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

const mockUser = { id: "1", username: "jdoe", email: "jdoe@example.com" };
const mockUpdateUser = vi.fn();

function renderSettingsPage() {
    return render(
        <MemoryRouter initialEntries={["/settings"]}>
            <Routes>
                <Route path="/settings" element={<SettingsPage />} />
            </Routes>
        </MemoryRouter>
    );
}

async function fillCurrentPassword(currentPassword = "hunter2") {
    await userEvent.type(screen.getByLabelText(/current password/i), currentPassword);
}

describe("SettingsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuth).mockReturnValue({
            user: mockUser,
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn(),
            updateUser: mockUpdateUser,
        });
    });

    it("pre-fills the form with the current user's info", () => {
        renderSettingsPage();

        expect(screen.getByLabelText(/^username$/i)).toHaveValue(mockUser.username);
        expect(screen.getByLabelText(/^email$/i)).toHaveValue(mockUser.email);
    });

    it("shows an error and does not call updateUser when new passwords do not match", async () => {
        renderSettingsPage();

        await userEvent.type(screen.getByLabelText(/^new password$/i), "newpass1");
        await userEvent.type(screen.getByLabelText(/confirm new password/i), "different");
        await fillCurrentPassword();
        await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

        expect(await screen.findByRole("alert")).toHaveTextContent("New passwords do not match.");
        expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it("updates the username and email without changing the password", async () => {
        mockUpdateUser.mockResolvedValue(undefined);
        renderSettingsPage();

        await userEvent.clear(screen.getByLabelText(/^username$/i));
        await userEvent.type(screen.getByLabelText(/^username$/i), "newname");
        await fillCurrentPassword();
        await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

        expect(mockUpdateUser).toHaveBeenCalledWith(
            { username: "newname", email: mockUser.email },
            "hunter2",
            undefined
        );
        expect(await screen.findByRole("status")).toHaveTextContent("Settings updated.");
    });

    it("includes the new password when one is provided", async () => {
        mockUpdateUser.mockResolvedValue(undefined);
        renderSettingsPage();

        await userEvent.type(screen.getByLabelText(/^new password$/i), "newpassword");
        await userEvent.type(screen.getByLabelText(/confirm new password/i), "newpassword");
        await fillCurrentPassword();
        await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

        expect(mockUpdateUser).toHaveBeenCalledWith(
            { username: mockUser.username, email: mockUser.email },
            "hunter2",
            "newpassword"
        );
    });

    it("shows an error message when updating fails", async () => {
        mockUpdateUser.mockRejectedValue(new Error("Current password is incorrect."));
        renderSettingsPage();

        await fillCurrentPassword("wrong-password");
        await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

        expect(await screen.findByRole("alert")).toHaveTextContent("Current password is incorrect.");
    });
});
