import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Form } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import CenteredFormCard from "../components/CenteredFormCard";

/**
 * Account creation form. On success, logs the new user in and redirects
 * back to wherever `ProtectedRoute` sent them from (via
 * `location.state.from`), or the homepage if there wasn't one.
 */
export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        try {
            await register({ username, email }, password);
            const from = (location.state as { from?: Location } | null)?.from;
            navigate(from ?? "/", { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to register.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <CenteredFormCard title="Register">
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="username">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="confirmPassword">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                    />
                </Form.Group>

                {error && <Alert variant="danger" role="alert">{error}</Alert>}

                <Button type="submit" disabled={isSubmitting} className="w-100">
                    {isSubmitting ? "Registering..." : "Register"}
                </Button>
            </Form>
            <p className="mt-3 mb-0">
                Already have an account? <Link to="/login">Log In</Link>
            </p>
        </CenteredFormCard>
    );
}
