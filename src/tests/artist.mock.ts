import type { ArtistProfile, ArtistRelease, RawArtistRelease } from "../types/artist";

export const mockArtistProfile: ArtistProfile = {
    id: 3840,
    name: "Radiohead",
    profile: "Electronic and alternative rock band from Oxfordshire, England.",
};

// Raw shape as returned by GET /artists/{id}/releases — for mocking the HTTP
// layer. Includes a "master" entry (e.g. Hyper-Ego by ARTMS on the real API)
// to cover releases Discogs catalogues as a master grouping rather than a
// concrete release.
export const mockRawArtistReleases: RawArtistRelease[] = [
    {
        id: 1587168,
        title: "OK Computer",
        year: 1997,
        type: "release",
        role: "Main",
        resource_url: "https://api.discogs.com/releases/1587168",
    },
    {
        id: 4319898,
        title: "Kid A",
        year: 2000,
        type: "master",
        role: "Main",
        main_release: 249504,
        resource_url: "https://api.discogs.com/masters/4319898",
    },
];

// What artistService.getArtistReleases resolves the above down to.
export const mockArtistReleases: ArtistRelease[] = [
    { id: 1587168, title: "OK Computer", year: 1997, resource_url: "https://api.discogs.com/releases/1587168" },
    { id: 249504, title: "Kid A", year: 2000, resource_url: "https://api.discogs.com/masters/4319898" },
];
