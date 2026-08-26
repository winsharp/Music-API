import axios from "axios";

// Shared axios error -> user-facing message mapping, used by the catalog
// pages (Browse, Artist, Release) so each doesn't reimplement the same
// status-code branching.
export const getApiErrorMessage = (err: unknown): string => {
    if (!axios.isAxiosError(err)) {
        return "Something went wrong fetching results. Please try again.";
    }
    if (!err.response) {
        return "Couldn't reach Discogs — check your internet connection and try again.";
    }
    const status = err.response.status;
    if (status === 401) {
        return "Discogs rejected the request — the API token may be missing or invalid.";
    }
    if (status === 404) {
        return "That couldn't be found on Discogs.";
    }
    if (status === 429) {
        return "Too many requests right now — the Discogs API rate limit was hit. Please wait a moment and try again.";
    }
    if (status === 500) {
        const message = err.response.data?.message;
        return message ? `Discogs server error: ${message}` : "Discogs is having server issues right now. Please try again later.";
    }
    return "Something went wrong fetching results. Please try again.";
};
