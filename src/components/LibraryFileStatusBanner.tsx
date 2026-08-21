import type { LibraryFileStatus } from "../types/LibraryContextValue";

interface LibraryFileStatusBannerProps {
    status: LibraryFileStatus;
    error: string | null;
    onOpen: () => void;
    onCreate: () => void;
    onGrantPermission: () => void;
}

const LibraryFileStatusBanner = ({
    status,
    error,
    onOpen,
    onCreate,
    onGrantPermission,
}: LibraryFileStatusBannerProps) => {
    if (status === "ready") return null;

    if (status === "unsupported") {
        return (
            <p role="alert">
                Your browser doesn't support saving your library to a file. Try Chrome or Edge.
            </p>
        );
    }

    if (status === "loading") {
        return <p>Connecting to your library file...</p>;
    }

    if (status === "needs-permission") {
        return (
            <div>
                <p>Reconnect your library file to see your ratings and lists.</p>
                <button type="button" onClick={onGrantPermission}>
                    Reconnect Library File
                </button>
            </div>
        );
    }

    // "disconnected" or "error"
    return (
        <div>
            <p>Connect a library file to save your ratings and lists.</p>
            {error && <p role="alert">{error}</p>}
            <button type="button" onClick={onOpen}>
                Open Existing Library File
            </button>
            <button type="button" onClick={onCreate}>
                Create New Library File
            </button>
        </div>
    );
};

export default LibraryFileStatusBanner;
