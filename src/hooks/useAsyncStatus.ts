import { useState } from "react";

export type AsyncStatus = "idle" | "saving" | "saved" | "error";

/**
 * Tracks the idle/saving/saved/error lifecycle of a fire-and-forget async
 * action (e.g. a save/rate/wantlist-toggle button) so callers don't each
 * reimplement the same setStatus("saving") / try / catch dance.
 */
export function useAsyncStatus() {
    const [status, setStatus] = useState<AsyncStatus>("idle");

    const run = async (action: () => Promise<void>) => {
        setStatus("saving");
        try {
            await action();
            setStatus("saved");
        } catch {
            setStatus("error");
        }
    };

    return [status, run] as const;
}
