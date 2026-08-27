import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { authService } from "../services/authService";

vi.mock("../services/authService", () => ({
    authService: {
        getSessionUser: vi.fn(),
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn(),
    },
}));

const updatedMockUser = { id: "1", username: "newname", email: "new@example.com" };

const mockUser = { id: "1", username: "jdoe", email: "jdoe@example.com" };
const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe("AuthContext", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(authService.getSessionUser).mockReturnValue(null);
    });

    it("throws when useAuth is used outside of an AuthProvider", () => {
        expect(() => renderHook(() => useAuth())).toThrow(
            "useAuth must be used within an AuthProvider"
        );
    });

    it("initializes user state from the existing session", () => {
        vi.mocked(authService.getSessionUser).mockReturnValue(mockUser);

        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current.user).toEqual(mockUser);
    });

    it("logs in and updates the user state", async () => {
        vi.mocked(authService.login).mockResolvedValue(mockUser);

        const { result } = renderHook(() => useAuth(), { wrapper });
        expect(result.current.user).toBeNull();

        await act(async () => {
            await result.current.login("jdoe", "hunter2");
        });

        expect(authService.login).toHaveBeenCalledWith("jdoe", "hunter2");
        expect(result.current.user).toEqual(mockUser);
    });

    it("propagates login errors and leaves the user state unchanged", async () => {
        vi.mocked(authService.login).mockRejectedValue(new Error("Invalid username or password."));

        const { result } = renderHook(() => useAuth(), { wrapper });

        await expect(
            act(async () => {
                await result.current.login("jdoe", "wrong");
            })
        ).rejects.toThrow("Invalid username or password.");

        expect(result.current.user).toBeNull();
    });

    it("registers and updates the user state", async () => {
        vi.mocked(authService.register).mockResolvedValue(mockUser);

        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            await result.current.register({ username: "jdoe", email: "jdoe@example.com" }, "hunter2");
        });

        expect(authService.register).toHaveBeenCalledWith(
            { username: "jdoe", email: "jdoe@example.com" },
            "hunter2"
        );
        expect(result.current.user).toEqual(mockUser);
    });

    it("logs out and clears the user state", async () => {
        vi.mocked(authService.getSessionUser).mockReturnValue(mockUser);

        const { result } = renderHook(() => useAuth(), { wrapper });
        expect(result.current.user).toEqual(mockUser);

        act(() => {
            result.current.logout();
        });

        expect(authService.logout).toHaveBeenCalled();
        await waitFor(() => expect(result.current.user).toBeNull());
    });

    it("updates and updates the user state", async () => {
        vi.mocked(authService.getSessionUser).mockReturnValue(mockUser);
        vi.mocked(authService.updateUser).mockResolvedValue(updatedMockUser);

        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            await result.current.updateUser(
                { username: "newname", email: "new@example.com" },
                "hunter2",
                "newpassword"
            );
        });

        expect(authService.updateUser).toHaveBeenCalledWith(
            mockUser.id,
            { username: "newname", email: "new@example.com" },
            "hunter2",
            "newpassword"
        );
        expect(result.current.user).toEqual(updatedMockUser);
    });

    it("throws when updateUser is called while logged out", async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        await expect(
            act(async () => {
                await result.current.updateUser({ username: "newname", email: "new@example.com" }, "hunter2");
            })
        ).rejects.toThrow("Not logged in.");

        expect(authService.updateUser).not.toHaveBeenCalled();
    });
});
