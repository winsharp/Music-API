// Local, client-only account system for the app's own login (separate from
// Discogs OAuth — see discogsOAuthService.ts). Accounts and the active
// session are persisted to localStorage; passwords are never stored in
// plaintext, only as bcrypt hashes.

import bcrypt from "bcryptjs";
import type { User } from "../types/user";

interface StoredUser extends User {
    passwordHash: string;
}

const USERS_KEY = "music-api:users";
const SESSION_KEY = "music-api:session";
const SALT_ROUNDS = 10;

function readUsers(): StoredUser[] {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as StoredUser[];
    } catch {
        return [];
    }
}

function writeUsers(users: StoredUser[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toPublicUser(stored: StoredUser): User {
    return { id: stored.id, username: stored.username, email: stored.email };
}

export const authService = {
    /**
     * Creates a new account, hashing the password with bcrypt, then logs the
     * new user in. Throws if the username or email is already taken.
     */
    async register(user: Omit<User, "id">, password: string): Promise<User> {
        const users = readUsers();
        if (users.some((u) => u.username.toLowerCase() === user.username.toLowerCase())) {
            throw new Error("Username is already taken.");
        }
        if (users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
            throw new Error("An account with this email already exists.");
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser: StoredUser = { ...user, id: crypto.randomUUID(), passwordHash };

        writeUsers([...users, newUser]);
        localStorage.setItem(SESSION_KEY, newUser.id);
        return toPublicUser(newUser);
    },

    /**
     * Verifies credentials against the stored account and, on success,
     * starts a session. Throws a generic "Invalid username or password."
     * error for both an unknown username and a wrong password, to avoid
     * leaking which one was incorrect.
     */
    async login(username: string, password: string): Promise<User> {
        const users = readUsers();
        const match = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
        if (!match) throw new Error("Invalid username or password.");

        const isMatch = await bcrypt.compare(password, match.passwordHash);
        if (!isMatch) throw new Error("Invalid username or password.");

        localStorage.setItem(SESSION_KEY, match.id);
        return toPublicUser(match);
    },

    /** Ends the current session. Does not delete the account itself. */
    logout(): void {
        localStorage.removeItem(SESSION_KEY);
    },

    /** Returns the currently logged-in user (from the stored session id), or `null`. */
    getSessionUser(): User | null {
        const sessionId = localStorage.getItem(SESSION_KEY);
        if (!sessionId) return null;
        const match = readUsers().find((u) => u.id === sessionId);
        return match ? toPublicUser(match) : null;
    },

    /**
     * Updates a user's username/email and, optionally, their password.
     * Requires `currentPassword` to match the stored hash. Throws if the
     * user doesn't exist, the current password is wrong, or the new
     * username/email is already taken by another account.
     */
    async updateUser(
        userId: string,
        updates: { username: string; email: string },
        currentPassword: string,
        newPassword?: string
    ): Promise<User> {
        const users = readUsers();
        const index = users.findIndex((u) => u.id === userId);
        if (index === -1) throw new Error("User not found.");

        const isMatch = await bcrypt.compare(currentPassword, users[index].passwordHash);
        if (!isMatch) throw new Error("Current password is incorrect.");

        if (
            users.some(
                (u) => u.id !== userId && u.username.toLowerCase() === updates.username.toLowerCase()
            )
        ) {
            throw new Error("Username is already taken.");
        }
        if (
            users.some((u) => u.id !== userId && u.email.toLowerCase() === updates.email.toLowerCase())
        ) {
            throw new Error("An account with this email already exists.");
        }

        const passwordHash = newPassword
            ? await bcrypt.hash(newPassword, SALT_ROUNDS)
            : users[index].passwordHash;
        const updatedUser: StoredUser = { ...users[index], ...updates, passwordHash };

        writeUsers(users.map((u) => (u.id === userId ? updatedUser : u)));
        return toPublicUser(updatedUser);
    },
};
