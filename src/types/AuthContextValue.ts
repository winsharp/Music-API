
import type { User } from "./user";

/** Shape of the value exposed by `AuthContext` / the `useAuth` hook. */
export interface AuthContextValue {
    /** The currently logged-in user, or `null` if no one is logged in. */
    user: User | null;
    /** Logs in with a username/password and updates `user` on success. */
    login: (username: string, password: string) => Promise<void>;
    /** Clears the current session and sets `user` back to `null`. */
    logout: () => void;
    /** Creates a new account and logs the created user in. */
    register: (user: Omit<User, "id">, password: string) => Promise<void>;
    /**
     * Updates the current user's profile, optionally changing their password.
     * `currentPassword` is required to verify the change; throws if no user
     * is logged in.
     */
    updateUser: (
        updates: { username: string; email: string },
        currentPassword: string,
        newPassword?: string
    ) => Promise<void>;
}