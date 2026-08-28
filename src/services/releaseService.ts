// Service file for fetching a single release's full detail (year, genres,
// tracklist, credited artists) — the Album page's data source.

import axios from "axios";
import type { ReleaseDetail } from "../types/release";
import { DISCOGS_BASE_URL as BASE_URL, DISCOGS_TOKEN as TOKEN } from "./discogsConfig";

export const getRelease = async (id: string | number): Promise<ReleaseDetail> => {
    const response = await axios.get<ReleaseDetail>(`${BASE_URL}/releases/${id}`, {
        params: { token: TOKEN },
    });
    return response.data;
};
