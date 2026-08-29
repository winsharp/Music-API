import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContextObject";

/**
 * Reads the current {@link AuthContextValue} (user + auth actions) from
 * `AuthContext`. Must be called from a component rendered inside
 * `AuthProvider` (see `App.tsx`), otherwise it throws.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
