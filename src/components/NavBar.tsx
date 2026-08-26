// Top-level navigation bar. Persists on every page except /login and /register.
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SearchBox from "./SearchBox";

const HIDDEN_PATHS = ["/login", "/register"];

const NavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    if (HIDDEN_PATHS.includes(location.pathname)) return null;

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav>
            <Link to="/">Home</Link>
            <SearchBox />
            <Link to="/browse">Browse Catalog</Link>
            {user ? (
                <>
                    <Link to="/profile">Profile</Link>
                    <button type="button" onClick={handleLogout}>
                        Log Out
                    </button>
                </>
            ) : (
                <Link to="/login">Log In</Link>
            )}
        </nav>
    );
};

export default NavBar;
