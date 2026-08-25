// Discogs "style" facet values — narrower sub-categories nested under a genre
// (e.g. Britpop is a style of the Rock genre, K-Pop a style of Pop/Rock).
// Discogs has hundreds of these and no "list styles" API endpoint, so this is
// a curated subset of well-known ones rather than the full taxonomy. Each
// entry was checked against the live /database/search endpoint (with
// style=<value>) to confirm it's a real, non-empty Discogs style before being
// added here — some plausible-looking names (e.g. "Northern Soul") aren't
// actually in Discogs' controlled style vocabulary and return zero results.
export const DISCOGS_STYLES = [
    "Alternative Rock",
    "Ambient",
    "Blues Rock",
    "Britpop",
    "City Pop",
    "Deep House",
    "Disco",
    "Drum n Bass",
    "Funk",
    "Gospel",
    "Grunge",
    "Hardcore",
    "House",
    "Indie Rock",
    "J-Pop",
    "K-Pop",
    "Metal",
    "New Wave",
    "Post-Punk",
    "Progressive Rock",
    "Punk",
    "Reggaeton",
    "Soul",
    "Synth-Pop",
    "Techno",
    "Trap",
    "Trip Hop",
    "Vaporwave",
] as const;
