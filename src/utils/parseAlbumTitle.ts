// Discogs release search results format titles as "Artist - Release Title".
// This splits that apart so the catalog can show Title and Artist separately.
export const parseAlbumTitle = (rawTitle: string): { artist: string; title: string } => {
    const separatorIndex = rawTitle.indexOf(" - ");
    if (separatorIndex === -1) {
        return { artist: "Unknown Artist", title: rawTitle };
    }
    return {
        artist: rawTitle.slice(0, separatorIndex),
        title: rawTitle.slice(separatorIndex + 3),
    };
};
