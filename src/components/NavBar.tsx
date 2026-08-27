// Top-level navigation bar. Persists on every page except /login and /register.
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
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
        <Navbar expand="lg" bg="dark" variant="dark" collapseOnSelect>
            <Container fluid>
                <Navbar.Brand as={Link} to="/">
                    Music API
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="main-navbar" />
                <Navbar.Collapse id="main-navbar">
                    <div className="d-flex align-items-center gap-2 my-2 my-lg-0 order-first order-lg-2">
                        <SearchBox />
                    </div>
                    <Nav className="me-auto order-lg-1">
                        <Nav.Link as={Link} to="/browse">
                            Browse Catalog
                        </Nav.Link>
                    </Nav>
                    <Nav className="ms-lg-2 order-lg-3">
                        {user ? (
                            <>
                                <Nav.Link as={Link} to="/profile">
                                    Profile
                                </Nav.Link>
                                <Nav.Link as={Link} to="/settings">
                                    Settings
                                </Nav.Link>
                                <Nav.Link as="button" type="button" onClick={handleLogout}>
                                    Log Out
                                </Nav.Link>
                            </>
                        ) : (
                            <Nav.Link as={Link} to="/login">
                                Log In
                            </Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavBar;
