import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/user";
import { authService } from "../services/authService";
import { AuthContext } from "./AuthContextObject";

/**
 * Provides app-wide authentication state (the current `user`) and the actions
 * that mutate it (`login`, `register`, `logout`, `updateUser`) via
 * {@link AuthContext}. Wrap the app in this once (see `App.tsx`) and read the
 * value with the `useAuth` hook rather than consuming `AuthContext` directly.
 *
 * On mount, the current user is seeded from `authService.getSessionUser()` so
 * a previously logged-in session survives a page refresh.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => authService.getSessionUser());

    /** Logs in with a username/password and stores the resulting user in state. */
    const login = useCallback(async (username: string, password: string) => {
        const loggedInUser = await authService.login(username, password);
        setUser(loggedInUser);
    }, []);

    /** Registers a new account and logs the created user in immediately. */
    const register = useCallback(async (user: Omit<User, "id">, password: string) => {
        const createdUser = await authService.register(user, password);
        setUser(createdUser);
    }, []);

    /** Clears the session (both server-side/local storage and in-memory state). */
    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
    }, []);

    /**
     * Updates the logged-in user's profile (username/email), optionally
     * changing their password. Requires the current password for verification.
     * Throws if called while no user is logged in.
     */
    const updateUser = useCallback(
        async (updates: { username: string; email: string }, currentPassword: string, newPassword?: string) => {
            if (!user) throw new Error("Not logged in.");
            const updatedUser = await authService.updateUser(user.id, updates, currentPassword, newPassword);
            setUser(updatedUser);
        },
        [user]
    );

    return (
        <AuthContext.Provider value={{ user, login, logout, register, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};