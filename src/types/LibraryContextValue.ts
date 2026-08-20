
import type { RatedItem, LibraryItemType } from "../interfaces/ratedItem";
import type { UserList } from "../interfaces/userList";

// "unsupported": browser lacks the File System Access API
// "disconnected": no library file has ever been chosen
// "needs-permission": a file was chosen before, but the browser needs a
//                      fresh user gesture to re-grant read/write access
// "loading": actively reading/writing the file
// "ready": connected and in sync
// "error": something went wrong (see fileError)
export type LibraryFileStatus =
    | "unsupported"
    | "disconnected"
    | "needs-permission"
    | "loading"
    | "ready"
    | "error";

export interface LibraryContextValue {
    ratings: RatedItem[];
    lists: UserList[];

    fileStatus: LibraryFileStatus;
    fileError: string | null;
    openLibraryFile: () => Promise<void>;
    createLibraryFile: () => Promise<void>;
    grantFilePermission: () => Promise<void>;

    // lookups for detail pages (Song/Album/Artist) to consume cheaply
    getRating: (refId: number, itemType: LibraryItemType) => RatedItem | undefined;

    // mutations
    rateItem: (item: Omit<RatedItem, "rating" | "ratedAt">, rating: number) => Promise<void>;
    removeRating: (itemId: string) => Promise<void>;

    createList: (name: string) => Promise<UserList>;
    deleteList: (listId: string) => Promise<void>;
    addToList: (listId: string, item: Omit<RatedItem, "rating" | "ratedAt">) => Promise<void>;
    removeFromList: (listId: string, itemId: string) => Promise<void>;
}