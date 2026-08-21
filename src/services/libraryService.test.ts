import { describe, it, expect, vi, beforeEach } from "vitest";
import { libraryService } from "./libraryService";
import { readLibraryFile, writeLibraryFile } from "./libraryFileStore";
import type { LibraryFileData } from "../interfaces/libraryFileData";

vi.mock("./libraryFileStore", () => ({
    readLibraryFile: vi.fn(),
    writeLibraryFile: vi.fn(),
}));

const userId = "user-1";

function mockFile(data: LibraryFileData) {
    vi.mocked(readLibraryFile).mockResolvedValue(data);
}

describe("libraryService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getRatings / getLists", () => {
        it("returns empty arrays when the user has no data yet", async () => {
            mockFile({ users: {} });

            expect(await libraryService.getRatings(userId)).toEqual([]);
            expect(await libraryService.getLists(userId)).toEqual([]);
        });
    });

    describe("rateItem", () => {
        it("adds a new rating and persists it", async () => {
            mockFile({ users: {} });

            const ratings = await libraryService.rateItem(
                userId,
                { id: "release:1", itemType: "release", refId: 1, title: "Abbey Road" },
                5
            );

            expect(ratings).toHaveLength(1);
            expect(ratings[0]).toMatchObject({ id: "release:1", rating: 5, title: "Abbey Road" });
            expect(ratings[0].ratedAt).toBeTruthy();
            expect(writeLibraryFile).toHaveBeenCalledWith({
                users: { [userId]: { ratings, lists: [] } },
            });
        });

        it("updates an existing rating instead of duplicating it", async () => {
            mockFile({
                users: {
                    [userId]: {
                        ratings: [
                            {
                                id: "release:1",
                                itemType: "release",
                                refId: 1,
                                title: "Abbey Road",
                                rating: 3,
                                ratedAt: "2020-01-01T00:00:00.000Z",
                            },
                        ],
                        lists: [],
                    },
                },
            });

            const ratings = await libraryService.rateItem(
                userId,
                { id: "release:1", itemType: "release", refId: 1, title: "Abbey Road" },
                5
            );

            expect(ratings).toHaveLength(1);
            expect(ratings[0].rating).toBe(5);
        });
    });

    describe("removeRating", () => {
        it("removes the matching rating", async () => {
            mockFile({
                users: {
                    [userId]: {
                        ratings: [
                            {
                                id: "release:1",
                                itemType: "release",
                                refId: 1,
                                title: "Abbey Road",
                                rating: 5,
                                ratedAt: "2020-01-01T00:00:00.000Z",
                            },
                        ],
                        lists: [],
                    },
                },
            });

            const ratings = await libraryService.removeRating(userId, "release:1");

            expect(ratings).toEqual([]);
        });
    });

    describe("createList", () => {
        it("creates a new empty list", async () => {
            mockFile({ users: {} });

            const lists = await libraryService.createList(userId, "Favorites");

            expect(lists).toHaveLength(1);
            expect(lists[0]).toMatchObject({ name: "Favorites", items: [] });
            expect(lists[0].id).toBeTruthy();
        });
    });

    describe("addToList", () => {
        it("adds an item to the matching list", async () => {
            mockFile({
                users: {
                    [userId]: {
                        ratings: [],
                        lists: [{ id: "list-1", name: "Favorites", items: [], createdAt: "2020-01-01T00:00:00.000Z" }],
                    },
                },
            });

            const lists = await libraryService.addToList(userId, "list-1", {
                id: "release:1",
                itemType: "release",
                refId: 1,
                title: "Abbey Road",
            });

            expect(lists[0].items).toHaveLength(1);
        });

        it("does not add a duplicate item to the same list", async () => {
            mockFile({
                users: {
                    [userId]: {
                        ratings: [],
                        lists: [
                            {
                                id: "list-1",
                                name: "Favorites",
                                items: [{ id: "release:1", itemType: "release", refId: 1, title: "Abbey Road" }],
                                createdAt: "2020-01-01T00:00:00.000Z",
                            },
                        ],
                    },
                },
            });

            const lists = await libraryService.addToList(userId, "list-1", {
                id: "release:1",
                itemType: "release",
                refId: 1,
                title: "Abbey Road",
            });

            expect(lists[0].items).toHaveLength(1);
        });

        it("leaves other lists untouched", async () => {
            mockFile({
                users: {
                    [userId]: {
                        ratings: [],
                        lists: [
                            { id: "list-1", name: "Favorites", items: [], createdAt: "2020-01-01T00:00:00.000Z" },
                            { id: "list-2", name: "To Listen", items: [], createdAt: "2020-01-01T00:00:00.000Z" },
                        ],
                    },
                },
            });

            const lists = await libraryService.addToList(userId, "list-1", {
                id: "release:1",
                itemType: "release",
                refId: 1,
                title: "Abbey Road",
            });

            expect(lists.find((l) => l.id === "list-2")?.items).toEqual([]);
        });
    });

    describe("removeFromList", () => {
        it("removes the matching item from the list", async () => {
            mockFile({
                users: {
                    [userId]: {
                        ratings: [],
                        lists: [
                            {
                                id: "list-1",
                                name: "Favorites",
                                items: [{ id: "release:1", itemType: "release", refId: 1, title: "Abbey Road" }],
                                createdAt: "2020-01-01T00:00:00.000Z",
                            },
                        ],
                    },
                },
            });

            const lists = await libraryService.removeFromList(userId, "list-1", "release:1");

            expect(lists[0].items).toEqual([]);
        });
    });

    describe("deleteList", () => {
        it("removes the matching list entirely", async () => {
            mockFile({
                users: {
                    [userId]: {
                        ratings: [],
                        lists: [{ id: "list-1", name: "Favorites", items: [], createdAt: "2020-01-01T00:00:00.000Z" }],
                    },
                },
            });

            const lists = await libraryService.deleteList(userId, "list-1");

            expect(lists).toEqual([]);
        });
    });
});
