import { describe, it, expect, beforeEach } from "vitest";
import { authService } from "./authService";

const baseUser = { username: "jdoe", email: "jdoe@example.com" };
const password = "hunter2";

describe("authService", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe("register", () => {
        it("creates a new user and starts a session", async () => {
            const user = await authService.register(baseUser, password);

            expect(user.username).toBe(baseUser.username);
            expect(user.email).toBe(baseUser.email);
            expect(user.id).toBeTruthy();
            expect(authService.getSessionUser()).toEqual(user);
        });

        it("does not expose the password hash on the returned user", async () => {
            const user = await authService.register(baseUser, password);

            expect(user).not.toHaveProperty("passwordHash");
        });

        it("throws when the username is already taken (case-insensitive)", async () => {
            await authService.register(baseUser, password);

            await expect(
                authService.register({ username: "JDoe", email: "other@example.com" }, password)
            ).rejects.toThrow("Username is already taken.");
        });

        it("throws when the email is already registered (case-insensitive)", async () => {
            await authService.register(baseUser, password);

            await expect(
                authService.register({ username: "other", email: "JDOE@example.com" }, password)
            ).rejects.toThrow("An account with this email already exists.");
        });
    });

    describe("login", () => {
        it("logs in with correct credentials and starts a session", async () => {
            await authService.register(baseUser, password);
            authService.logout();

            const user = await authService.login(baseUser.username, password);

            expect(user.username).toBe(baseUser.username);
            expect(authService.getSessionUser()).toEqual(user);
        });

        it("is case-insensitive on username", async () => {
            await authService.register(baseUser, password);
            authService.logout();

            const user = await authService.login("JDOE", password);

            expect(user.username).toBe(baseUser.username);
        });

        it("throws for an unknown username", async () => {
            await expect(authService.login("nobody", password)).rejects.toThrow(
                "Invalid username or password."
            );
        });

        it("throws for an incorrect password", async () => {
            await authService.register(baseUser, password);
            authService.logout();

            await expect(authService.login(baseUser.username, "wrong-password")).rejects.toThrow(
                "Invalid username or password."
            );
        });
    });

    describe("logout", () => {
        it("clears the active session", async () => {
            await authService.register(baseUser, password);

            authService.logout();

            expect(authService.getSessionUser()).toBeNull();
        });
    });

    describe("getSessionUser", () => {
        it("returns null when there is no active session", () => {
            expect(authService.getSessionUser()).toBeNull();
        });

        it("returns null when the session references a user that no longer exists", async () => {
            await authService.register(baseUser, password);
            localStorage.setItem("music-api:users", "[]");

            expect(authService.getSessionUser()).toBeNull();
        });
    });
});
