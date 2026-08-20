import type { RatedItem } from "../interfaces/ratedItem";
import type { UserList } from "../interfaces/userList";
import type { UserLibraryData } from "../interfaces/libraryFileData";
import { readLibraryFile, writeLibraryFile } from "./libraryFileStore";

function emptyUserData(): UserLibraryData {
    return { ratings: [], lists: [] };
}

async function getUserData(userId: string): Promise<UserLibraryData> {
    const file = await readLibraryFile();
    return file.users[userId] ?? emptyUserData();
}

async function setUserData(userId: string, data: UserLibraryData): Promise<UserLibraryData> {
    const file = await readLibraryFile();
    file.users[userId] = data;
    await writeLibraryFile(file);
    return data;
}

export const libraryService = {
    async getRatings(userId: string): Promise<RatedItem[]> {
        return (await getUserData(userId)).ratings;
    },

    async rateItem(userId: string, item: Omit<RatedItem, "rating" | "ratedAt">, rating: number): Promise<RatedItem[]> {
        const data = await getUserData(userId);
        const newRating: RatedItem = { ...item, rating, ratedAt: new Date().toISOString() };
        const exists = data.ratings.some((r) => r.id === item.id);
        const ratings = exists
            ? data.ratings.map((r) => (r.id === item.id ? newRating : r))
            : [...data.ratings, newRating];

        const updated = await setUserData(userId, { ...data, ratings });
        return updated.ratings;
    },

    async removeRating(userId: string, itemId: string): Promise<RatedItem[]> {
        const data = await getUserData(userId);
        const ratings = data.ratings.filter((r) => r.id !== itemId);
        const updated = await setUserData(userId, { ...data, ratings });
        return updated.ratings;
    },

    async getLists(userId: string): Promise<UserList[]> {
        return (await getUserData(userId)).lists;
    },

    async createList(userId: string, name: string): Promise<UserList[]> {
        const data = await getUserData(userId);
        const newList: UserList = {
            id: crypto.randomUUID(),
            name,
            items: [],
            createdAt: new Date().toISOString(),
        };
        const updated = await setUserData(userId, { ...data, lists: [...data.lists, newList] });
        return updated.lists;
    },

    async addToList(userId: string, listId: string, item: Omit<RatedItem, "rating" | "ratedAt">): Promise<UserList[]> {
        const data = await getUserData(userId);
        const lists = data.lists.map((list) => {
            if (list.id !== listId) return list;
            if (list.items.some((i) => i.id === item.id)) return list;
            return { ...list, items: [...list.items, item] };
        });
        const updated = await setUserData(userId, { ...data, lists });
        return updated.lists;
    },

    async removeFromList(userId: string, listId: string, itemId: string): Promise<UserList[]> {
        const data = await getUserData(userId);
        const lists = data.lists.map((list) =>
            list.id === listId ? { ...list, items: list.items.filter((i) => i.id !== itemId) } : list
        );
        const updated = await setUserData(userId, { ...data, lists });
        return updated.lists;
    },

    async deleteList(userId: string, listId: string): Promise<UserList[]> {
        const data = await getUserData(userId);
        const lists = data.lists.filter((list) => list.id !== listId);
        const updated = await setUserData(userId, { ...data, lists });
        return updated.lists;
    },
};
