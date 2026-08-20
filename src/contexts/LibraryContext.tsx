// src/contexts/LibraryContext.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { RatedItem, LibraryItemType } from "../interfaces/ratedItem";
import type { UserList } from "../interfaces/userList";
import type { LibraryContextValue, LibraryFileStatus } from "../types/LibraryContextValue";
import { libraryService } from "../services/libraryService";
import {
    isFileSystemAccessSupported,
    tryReconnect,
    reconnectWithPermissionPrompt,
    openLibraryFile as openLibraryFileOnDisk,
    createLibraryFile as createLibraryFileOnDisk,
} from "../services/libraryFileStore";
import { useAuth } from "./AuthContext";

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined);

export const useLibrary = () => {
    const context = useContext(LibraryContext);
    if (!context) throw new Error("useLibrary must be used within a LibraryProvider");
    return context;
};

export const LibraryProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [ratings, setRatings] = useState<RatedItem[]>([]);
    const [lists, setLists] = useState<UserList[]>([]);
    const [fileStatus, setFileStatus] = useState<LibraryFileStatus>("disconnected");
    const [fileError, setFileError] = useState<string | null>(null);

    // Guards against a stale async load overwriting state after the user
    // switches accounts or the file connection changes mid-flight.
    const loadTokenRef = useRef(0);

    const loadUserData = useCallback(async (userId: string) => {
        const token = ++loadTokenRef.current;
        try {
            const [nextRatings, nextLists] = await Promise.all([
                libraryService.getRatings(userId),
                libraryService.getLists(userId),
            ]);
            if (loadTokenRef.current !== token) return;
            setRatings(nextRatings);
            setLists(nextLists);
        } catch (err) {
            if (loadTokenRef.current !== token) return;
            setFileError(err instanceof Error ? err.message : "Failed to read the library file.");
            setFileStatus("error");
        }
    }, []);

    // On mount, try to silently resume a previously connected file.
    useEffect(() => {
        let cancelled = false;

        async function resume() {
            if (!isFileSystemAccessSupported()) {
                if (!cancelled) setFileStatus("unsupported");
                return;
            }
            const result = await tryReconnect();
            if (cancelled) return;
            if (result === "connected") setFileStatus("ready");
            else if (result === "needs-permission") setFileStatus("needs-permission");
            else setFileStatus("disconnected");
        }

        void resume();
        return () => {
            cancelled = true;
        };
    }, []);

    // Reload whenever the logged-in user changes, or the file becomes ready.
    useEffect(() => {
        let cancelled = false;

        async function sync() {
            if (!user || fileStatus !== "ready") {
                if (!cancelled) {
                    setRatings([]);
                    setLists([]);
                }
                return;
            }
            await loadUserData(user.id);
        }

        void sync();
        return () => {
            cancelled = true;
        };
    }, [user, fileStatus, loadUserData]);

    const runFileAction = useCallback(async (action: () => Promise<void>) => {
        setFileStatus("loading");
        setFileError(null);
        try {
            await action();
            setFileStatus("ready");
        } catch (err) {
            setFileError(err instanceof Error ? err.message : "Something went wrong with the library file.");
            setFileStatus("error");
        }
    }, []);

    const openLibraryFile = useCallback(() => runFileAction(openLibraryFileOnDisk), [runFileAction]);
    const createLibraryFile = useCallback(() => runFileAction(createLibraryFileOnDisk), [runFileAction]);
    const grantFilePermission = useCallback(() => runFileAction(async () => {
        const granted = await reconnectWithPermissionPrompt();
        if (!granted) throw new Error("Permission to access the library file was denied.");
    }), [runFileAction]);

    const rateItem = useCallback(async (item: Omit<RatedItem, "rating" | "ratedAt">, rating: number) => {
        if (!user) return;
        setRatings(await libraryService.rateItem(user.id, item, rating));
    }, [user]);

    const removeRating = useCallback(async (itemId: string) => {
        if (!user) return;
        setRatings(await libraryService.removeRating(user.id, itemId));
    }, [user]);

    const createList = useCallback(async (name: string): Promise<UserList> => {
        if (!user) throw new Error("Must be logged in to create a list");
        const updated = await libraryService.createList(user.id, name);
        setLists(updated);
        return updated[updated.length - 1];
    }, [user]);

    const deleteList = useCallback(async (listId: string) => {
        if (!user) return;
        setLists(await libraryService.deleteList(user.id, listId));
    }, [user]);

    const addToList = useCallback(async (listId: string, item: Omit<RatedItem, "rating" | "ratedAt">) => {
        if (!user) return;
        setLists(await libraryService.addToList(user.id, listId, item));
    }, [user]);

    const removeFromList = useCallback(async (listId: string, itemId: string) => {
        if (!user) return;
        setLists(await libraryService.removeFromList(user.id, listId, itemId));
    }, [user]);

    const getRating = useCallback(
        (refId: number, itemType: LibraryItemType) =>
            ratings.find((r) => r.refId === refId && r.itemType === itemType),
        [ratings]
    );

    const value = useMemo<LibraryContextValue>(() => ({
        ratings, lists, fileStatus, fileError,
        openLibraryFile, createLibraryFile, grantFilePermission,
        getRating, rateItem, removeRating,
        createList, deleteList, addToList, removeFromList,
    }), [
        ratings, lists, fileStatus, fileError,
        openLibraryFile, createLibraryFile, grantFilePermission,
        getRating, rateItem, removeRating,
        createList, deleteList, addToList, removeFromList,
    ]);

    return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};
