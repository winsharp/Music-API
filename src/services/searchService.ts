//Service file to talk to Discogs and get it to hand data back

import axios from "axios";
//getting the type from search folder
//type{} - only for typechecking
import type{ SearchResponse} from "../types/search";

const BASE_URL = "https://api.discogs.com/database/search";
//read the token from env. file
const TOKEN = import.meta.env.VITE_DISCOGS_TOKEN;

//what the function expects, a string and an optional
interface SearchParams{
    query: string;
    genre?: string;
}
//network request so we need async and await
export const searchReleases = async({
    query,
    genre,
}: SearchParams): Promise<SearchResponse> => {
    //axios does a get, searchResponse tells ts the shape of the response so ide can autocomplete or catch errors
   const response = await axios.get<SearchResponse>(BASE_URL, {
       //axios will turns this object into URL query parameters
       params:{
           q:query,
           type: "release",
           genre,
           token: TOKEN,
       },
   });
   //axio wraps the response object. .data is JSON body -this is what we are going to use
   return response.data;
};
