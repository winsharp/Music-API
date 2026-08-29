import { useState } from "react";
import type { SubmitEvent } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import CenteredFormCard from "../components/CenteredFormCard";

/**
 * Lets a logged-in user edit their local app account (username, email,
 * password). This is separate from any linked Discogs account, which is
 * managed from the Profile page instead (see `ConnectDiscogsButton`).
 */
export default function SettingsPage() {
    const { user, updateUser } = useAuth();

    const [username, setUsername] = useState(user?.username ?? "");
    const [email, setEmail] = useState(user?.email ?? "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!user) return null; // ProtectedRoute guarantees this; keeps TS happy

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSuccess(false);

        if (newPassword && newPassword !== confirmNewPassword) {
            setError("New passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        try {
            await updateUser({ username, email }, currentPassword, newPassword || undefined);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update settings.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <CenteredFormCard title="Settings">
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
                <Form.Group className="mb-3" controlId="newPassword">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        placeholder="Leave blank to keep your current password"
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="confirmNewPassword">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        autoComplete="new-password"
                        disabled={!newPassword}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="currentPassword">
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                    <Form.Text>Required to confirm any changes.</Form.Text>
                </Form.Group>

                {error && <Alert variant="danger" role="alert">{error}</Alert>}
                {success && <Alert variant="success" role="status">Settings updated.</Alert>}

                <Button type="submit" disabled={isSubmitting} className="w-100">
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
            </Form>
        </CenteredFormCard>
    );
}
