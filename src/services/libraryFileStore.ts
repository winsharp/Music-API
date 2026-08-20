// Low-level read/write access to the user's chosen library.json file on disk,
// via the File System Access API. All domain logic (ratings, lists) lives in
// libraryService.ts, which sits on top of this.

import type { LibraryFileData } from "../interfaces/libraryFileData";
import { loadFileHandle, saveFileHandle, clearFileHandle } from "./fileHandleStore";

const EMPTY_FILE: LibraryFileData = { users: {} };

export function isFileSystemAccessSupported(): boolean {
    return typeof window !== "undefined" && "showSaveFilePicker" in window;
}

let cachedHandle: FileSystemFileHandle | undefined;

async function ensurePermission(handle: FileSystemFileHandle, mode: FileSystemPermissionMode): Promise<boolean> {
    const status = await handle.queryPermission({ mode });
    if (status === "granted") return true;
    // requestPermission requires a user gesture; callers should invoke this
    // from a click handler, not on mount.
    const requested = await handle.requestPermission({ mode });
    return requested === "granted";
}

const JSON_FILE_TYPE = { description: "Library JSON", accept: { "application/json": [".json"] } };

function assertSupported(): void {
    if (!isFileSystemAccessSupported() || !window.showSaveFilePicker || !window.showOpenFilePicker) {
        throw new Error("Your browser doesn't support saving files directly (try Chrome or Edge).");
    }
}

async function adoptHandle(handle: FileSystemFileHandle): Promise<void> {
    const granted = await ensurePermission(handle, "readwrite");
    if (!granted) throw new Error("Permission to read/write the file was denied.");

    // If it's a brand-new file, seed it with an empty structure.
    const file = await handle.getFile();
    if (file.size === 0) {
        await writeToHandle(handle, EMPTY_FILE);
    }

    cachedHandle = handle;
    await saveFileHandle(handle);
}

// Called from a button click: user picks an existing library.json file.
export async function openLibraryFile(): Promise<void> {
    assertSupported();
    const [handle] = await window.showOpenFilePicker!({
        multiple: false,
        types: [JSON_FILE_TYPE],
    });
    await adoptHandle(handle);
}

// Called from a button click: user chooses where to create a new library.json.
export async function createLibraryFile(): Promise<void> {
    assertSupported();
    const handle = await window.showSaveFilePicker!({
        suggestedName: "music-api-library.json",
        types: [JSON_FILE_TYPE],
    });
    await adoptHandle(handle);
}

export type ReconnectResult = "connected" | "needs-permission" | "none";

let pendingHandle: FileSystemFileHandle | undefined;

// Called on app start: tries to reuse a previously connected file without
// prompting the user for a new picker. Permission may still need a user
// gesture (browser security) — callers should surface a "reconnect" button
// when this resolves to "needs-permission".
export async function tryReconnect(): Promise<ReconnectResult> {
    const handle = await loadFileHandle();
    if (!handle) return "none";

    const status = await handle.queryPermission({ mode: "readwrite" });
    if (status === "granted") {
        cachedHandle = handle;
        return "connected";
    }

    pendingHandle = handle;
    return "needs-permission";
}

// Must be called from a click handler — re-requesting permission requires a
// user gesture.
export async function reconnectWithPermissionPrompt(): Promise<boolean> {
    const handle = pendingHandle ?? cachedHandle ?? (await loadFileHandle());
    if (!handle) return false;

    const granted = await ensurePermission(handle, "readwrite");
    if (!granted) return false;

    cachedHandle = handle;
    pendingHandle = undefined;
    return true;
}

export function isConnected(): boolean {
    return cachedHandle !== undefined;
}

export async function disconnectLibraryFile(): Promise<void> {
    cachedHandle = undefined;
    await clearFileHandle();
}

async function writeToHandle(handle: FileSystemFileHandle, data: LibraryFileData): Promise<void> {
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
}

export async function readLibraryFile(): Promise<LibraryFileData> {
    if (!cachedHandle) throw new Error("No library file connected.");
    const file = await cachedHandle.getFile();
    const text = await file.text();
    if (!text) return { users: {} };
    try {
        return JSON.parse(text) as LibraryFileData;
    } catch {
        return { users: {} };
    }
}

export async function writeLibraryFile(data: LibraryFileData): Promise<void> {
    if (!cachedHandle) throw new Error("No library file connected.");
    await writeToHandle(cachedHandle, data);
}
