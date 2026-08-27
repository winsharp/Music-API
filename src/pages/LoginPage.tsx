import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Form } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import CenteredFormCard from "../components/CenteredFormCard";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await login(username, password);
            const from = (location.state as { from?: Location } | null)?.from;
            navigate(from ?? "/", { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to log in.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <CenteredFormCard title="Log In">
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
                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                </Form.Group>

                {error && <Alert variant="danger" role="alert">{error}</Alert>}

                <Button type="submit" disabled={isSubmitting} className="w-100">
                    {isSubmitting ? "Logging in..." : "Log In"}
                </Button>
            </Form>
            <p className="mt-3 mb-0">
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </CenteredFormCard>
    );
}
