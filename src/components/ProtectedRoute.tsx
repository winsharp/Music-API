import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Route guard for pages that require a logged-in user (Profile, Settings,
 * Discogs callback): redirects to `/login` (remembering the attempted
 * location in router state, as `from`, so login can send the user back)
 * instead of rendering `children`. Counterpart to `GuestRoute`.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
