import type { RatedItem } from "./ratedItem";
import type { UserList } from "./userList";

export interface UserLibraryData {
    ratings: RatedItem[];
    lists: UserList[];
}

// The whole library JSON file, keyed by userId so multiple local accounts
// can share the same file without stepping on each other's data.
export interface LibraryFileData {
    users: Record<string, UserLibraryData>;
}
