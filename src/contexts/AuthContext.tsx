import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/user";
import { authService } from "../services/authService";
import { AuthContext } from "./AuthContextObject";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => authService.getSessionUser());

    const login = useCallback(async (username: string, password: string) => {
        const loggedInUser = await authService.login(username, password);
        setUser(loggedInUser);
    }, []);

    const register = useCallback(async (user: Omit<User, "id">, password: string) => {
        const createdUser = await authService.register(user, password);
        setUser(createdUser);
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
    }, []);

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