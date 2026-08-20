// Persists a FileSystemFileHandle across page reloads using IndexedDB.
// (FileSystemFileHandle is structured-cloneable, but not JSON-serializable,
// so it can't live in localStorage — IndexedDB is the only option.)

const DB_NAME = "music-api-fs";
const STORE_NAME = "handles";
const HANDLE_KEY = "library-file";

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore(STORE_NAME);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function saveFileHandle(handle: FileSystemFileHandle): Promise<void> {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    db.close();
}

export async function loadFileHandle(): Promise<FileSystemFileHandle | undefined> {
    const db = await openDb();
    const handle = await new Promise<FileSystemFileHandle | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(HANDLE_KEY);
        req.onsuccess = () => resolve(req.result as FileSystemFileHandle | undefined);
        req.onerror = () => reject(req.error);
    });
    db.close();
    return handle;
}

export async function clearFileHandle(): Promise<void> {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(HANDLE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    db.close();
}
