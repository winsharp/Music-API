import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useDiscogsConnection } from "../hooks/useDiscogsConnection";

// "/profile" (no username) sends the logged-in user to their own profile:
// their linked Discogs account if they've connected one, otherwise their
// app username as a best-effort guess/lookup.
export default function MyProfileRedirect() {
    const { user } = useAuth();
    const { connection } = useDiscogsConnection();

    if (!user) return null; // ProtectedRoute guarantees this; keeps TS happy

    const username = connection?.discogsUsername ?? user.username;
    return <Navigate to={`/profile/${username}`} replace />;
}
