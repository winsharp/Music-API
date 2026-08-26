import type { ReleaseDetail } from "../types/release";

export const mockReleaseDetail: ReleaseDetail = {
    id: 1587168,
    title: "OK Computer",
    year: 1997,
    genres: ["Rock"],
    styles: ["Alternative Rock", "Experimental", "Art Rock"],
    artists: [{ id: 3840, name: "Radiohead" }],
    tracklist: [
        { position: "", type_: "heading", title: "Side A", duration: "" },
        { position: "A1", type_: "track", title: "Airbag", duration: "4:44" },
        { position: "A2", type_: "track", title: "Paranoid Android", duration: "6:23" },
    ],
    thumb: "https://example.com/ok-computer.jpg",
};
