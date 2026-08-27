import { Alert, Button } from "react-bootstrap";
import { useDiscogsConnection } from "../hooks/useDiscogsConnection";

const ConnectDiscogsButton = () => {
    const { connection, connecting, error, connect, disconnect } = useDiscogsConnection();

    return (
        <div>
            {connection ? (
                <p className="d-flex align-items-center justify-content-center gap-2 mb-0">
                    Connected to Discogs as {connection.discogsUsername}{" "}
                    <Button variant="outline-secondary" size="sm" onClick={disconnect}>
                        Disconnect
                    </Button>
                </p>
            ) : (
                <Button variant="primary" onClick={connect} disabled={connecting}>
                    {connecting ? "Connecting..." : "Connect Discogs Account"}
                </Button>
            )}
            {error && <Alert variant="danger" role="alert" className="mt-2">{error}</Alert>}
        </div>
    );
};

export default ConnectDiscogsButton;
