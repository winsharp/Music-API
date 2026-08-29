import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Route guard for pages that only make sense when logged out (Login,
 * Register): redirects an already-authenticated user to the homepage
 * instead of rendering `children`. Counterpart to `ProtectedRoute`.
 */
export default function GuestRoute({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/" replace />;
    }

    return children;
}
