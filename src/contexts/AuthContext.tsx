import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../interfaces/user";
import type { AuthContextValue } from "../types/AuthContextValue";
import { authService } from "../services/authService";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

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

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};
