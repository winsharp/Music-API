import bcrypt from "bcryptjs";
import type { User } from "../interfaces/user";

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

    async login(username: string, password: string): Promise<User> {
        const users = readUsers();
        const match = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
        if (!match) throw new Error("Invalid username or password.");

        const isMatch = await bcrypt.compare(password, match.passwordHash);
        if (!isMatch) throw new Error("Invalid username or password.");

        localStorage.setItem(SESSION_KEY, match.id);
        return toPublicUser(match);
    },

    logout(): void {
        localStorage.removeItem(SESSION_KEY);
    },

    getSessionUser(): User | null {
        const sessionId = localStorage.getItem(SESSION_KEY);
        if (!sessionId) return null;
        const match = readUsers().find((u) => u.id === sessionId);
        return match ? toPublicUser(match) : null;
    },
};
