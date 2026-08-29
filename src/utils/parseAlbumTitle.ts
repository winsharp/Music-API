/**
 * Placeholder used wherever a release has no real artist to look up on
 * Discogs (an unparsed search result title, or missing artist data) — never
 * a real artist name, so it should never be rendered as a clickable link.
 */
export const UNKNOWN_ARTIST = "Unknown Artist";

/**
 * Discogs release search results format titles as "Artist - Release Title".
 * This splits that apart so the catalog can show Title and Artist separately.
 * Falls back to {@link UNKNOWN_ARTIST} when the separator isn't found.
 */
export const parseAlbumTitle = (rawTitle: string): { artist: string; title: string } => {
    const separatorIndex = rawTitle.indexOf(" - ");
    if (separatorIndex === -1) {
        return { artist: UNKNOWN_ARTIST, title: rawTitle };
    }
    return {
        artist: rawTitle.slice(0, separatorIndex),
        title: rawTitle.slice(separatorIndex + 3),
    };
};
