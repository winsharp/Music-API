
import type { User } from "../interfaces/user";

export interface AuthContextValue {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    register: (user: Omit<User, "id">, password: string) => Promise<void>;
}