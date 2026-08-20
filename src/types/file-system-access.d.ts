// Minimal ambient declarations for the File System Access API.
// TypeScript's bundled DOM lib doesn't ship these yet.
export {};

declare global {
    type FileSystemPermissionMode = "read" | "readwrite";

    interface FileSystemHandlePermissionDescriptor {
        mode?: FileSystemPermissionMode;
    }

    interface FileSystemHandle {
        queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
        requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
    }

    interface FilePickerAcceptType {
        description?: string;
        accept: Record<string, string[]>;
    }

    interface FilePickerOptions {
        suggestedName?: string;
        types?: FilePickerAcceptType[];
        excludeAcceptAllOption?: boolean;
    }

    interface OpenFilePickerOptions extends FilePickerOptions {
        multiple?: boolean;
    }

    interface Window {
        showOpenFilePicker?(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]>;
        showSaveFilePicker?(options?: FilePickerOptions): Promise<FileSystemFileHandle>;
    }
}
