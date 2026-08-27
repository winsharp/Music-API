//Service file to talk to Discogs and get it to hand data back

import axios from "axios";
//getting the type from search folder
//type{} - only for typechecking
import type{ SearchResponse} from "../types/search";

const BASE_URL = import.meta.env.VITE_DISCOGS_BASE_URL;
//read the token from env. file
const TOKEN = import.meta.env.VITE_DISCOGS_TOKEN;
//how many results to show per page of search results
const PER_PAGE = 25;

//what the function expects, a string and an optional
interface SearchParams{
    query: string;
    genre?: string;
    page?: number;
}
//network request so we need async and await
export const searchReleases = async({
    query,
    genre,
    page,
}: SearchParams): Promise<SearchResponse> => {
    //axios does a get, searchResponse tells ts the shape of the response so ide can autocomplete or catch errors
    const response = await axios.get<SearchResponse>(`${BASE_URL}/database/search`, {
        params: {
            q: query,
            type: "release",
            genre,
            token: TOKEN,
            page,
            per_page: PER_PAGE,
        },
    });
   //axio wraps the response object. .data is JSON body -this is what we are going to use
   return response.data;
};
