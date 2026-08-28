// Shared Discogs API configuration, read once from Vite env vars instead of
// every service re-reading `import.meta.env` for the same two values.
export const DISCOGS_BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;
export const DISCOGS_TOKEN = import.meta.env.VITE_DISCOGS_TOKEN;
