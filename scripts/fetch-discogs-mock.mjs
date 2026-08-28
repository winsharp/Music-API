// One-off script to pull a Discogs user's profile + collection releases
// (rated and unrated alike, rating will be 0 for unrated ones) into the
// static mock shape used for local mocks. Run with:
//   node --env-file=.env scripts/fetch-discogs-mock.mjs <username> <outFile>
//
// Reads VITE_DISCOGS_TOKEN / VITE_DISCOGS_BASE_URL from the environment
// (loaded from .env via --env-file) so the token never needs to be typed
// anywhere else.
const [, , username, outFile] = process.argv;
if (!username || !outFile) {
    console.error("Usage: node --env-file=.env scripts/fetch-discogs-mock.mjs <username> <outFile>");
    process.exit(1);
}
const BASE_URL = process.env.VITE_DISCOGS_BASE_URL ?? "https://api.discogs.com";
const TOKEN = process.env.VITE_DISCOGS_TOKEN;
if (!TOKEN) {
    console.error("VITE_DISCOGS_TOKEN is not set in the environment.");
    process.exit(1);
}
const headers = { "User-Agent": "MusicApi/1.0" };
async function fetchJson(path, params) {
    const url = new URL(path, BASE_URL);
    url.searchParams.set("token", TOKEN);
    for (const [key, value] of Object.entries(params ?? {})) {
        url.searchParams.set(key, String(value));
    }
    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(`${path} failed: ${response.status} ${await response.text()}`);
    }
    return response.json();
}
async function fetchAllReleases() {
    const releases = [];
    let page = 1;
    let pages = 1;
    do {
        const data = await fetchJson(`/users/${username}/collection/folders/0/releases`, {
            per_page: 100,
            page,
        });
        pages = data.pagination.pages;
        for (const release of data.releases) {
            releases.push({
                id: release.basic_information.id,
                title: release.basic_information.title,
                artist: release.basic_information.artists?.[0]?.name ?? "Unknown",
                rating: release.rating,
                thumb: release.basic_information.thumb,
            });
        }
        page += 1;
    } while (page <= pages);
    return releases;
}
const profile = await fetchJson(`/users/${username}`);
const ratedReleases = await fetchAllReleases();
const mock = {
    username: profile.username,
    avatarUrl: profile.avatar_url,
    ratedReleases,
};
const { writeFile, mkdir } = await import("node:fs/promises");
const { dirname } = await import("node:path");
await mkdir(dirname(outFile), { recursive: true });
await writeFile(outFile, JSON.stringify(mock, null, 2) + "\n");
console.log(`Wrote ${ratedReleases.length} releases (rated + unrated) for "${profile.username}" to ${outFile}`);