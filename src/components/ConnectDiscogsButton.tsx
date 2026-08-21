import { useDiscogsConnection } from "../hooks/useDiscogsConnection";

const ConnectDiscogsButton = () => {
    const { connection, connecting, error, connect, disconnect } = useDiscogsConnection();

    return (
        <div>
            {connection ? (
                <p>
                    Connected to Discogs as {connection.discogsUsername}{" "}
                    <button type="button" onClick={disconnect}>
                        Disconnect
                    </button>
                </p>
            ) : (
                <button type="button" onClick={connect} disabled={connecting}>
                    {connecting ? "Connecting..." : "Connect Discogs Account"}
                </button>
            )}
            {error && <p role="alert">{error}</p>}
        </div>
    );
};

export default ConnectDiscogsButton;
