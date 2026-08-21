import { useState } from "react";
import type { SubmitEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLibrary } from "../contexts/LibraryContext";
import RatedItemCard from "../components/RatedItemCard";
import LibraryFileStatusBanner from "../components/LibraryFileStatusBanner";

export default function ProfilePage() {
    const { user } = useAuth();
    const {
        ratings,
        lists,
        fileStatus,
        fileError,
        openLibraryFile,
        createLibraryFile,
        grantFilePermission,
        removeRating,
        createList,
        deleteList,
        removeFromList,
    } = useLibrary();

    const [newListName, setNewListName] = useState("");
    const [listError, setListError] = useState<string | null>(null);
    const [isCreatingList, setIsCreatingList] = useState(false);

    if (!user) return null; // ProtectedRoute guarantees this; keeps TS happy

    const albums = ratings.filter((r) => r.itemType === "release" || r.itemType === "master");

    async function handleCreateList(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const name = newListName.trim();
        if (!name) return;

        setListError(null);
        setIsCreatingList(true);
        try {
            await createList(name);
            setNewListName("");
        } catch (err) {
            setListError(err instanceof Error ? err.message : "Failed to create list.");
        } finally {
            setIsCreatingList(false);
        }
    }

    return (
        <div>
            <section>
                <h1>{user.username}</h1>
                <p>{user.email}</p>
            </section>

            <LibraryFileStatusBanner
                status={fileStatus}
                error={fileError}
                onOpen={openLibraryFile}
                onCreate={createLibraryFile}
                onGrantPermission={grantFilePermission}
            />

            {fileStatus === "ready" && (
                <>
                    <section>
                        <h2>Albums</h2>
                        {albums.length === 0 ? (
                            <p>No albums rated yet.</p>
                        ) : (
                            <div>
                                {albums.map((item) => (
                                    <RatedItemCard
                                        key={item.id}
                                        item={item}
                                        onRemove={() => removeRating(item.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    <section>
                        <h2>My Lists</h2>
                        <form onSubmit={handleCreateList}>
                            <label htmlFor="newListName">New list name</label>
                            <input
                                id="newListName"
                                type="text"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={isCreatingList}>
                                {isCreatingList ? "Creating..." : "Create List"}
                            </button>
                        </form>
                        {listError && <p role="alert">{listError}</p>}

                        {lists.length === 0 ? (
                            <p>You haven't created any lists yet.</p>
                        ) : (
                            lists.map((list) => (
                                <div key={list.id}>
                                    <h3>{list.name}</h3>
                                    <button type="button" onClick={() => deleteList(list.id)}>
                                        Delete List
                                    </button>
                                    {list.items.length === 0 ? (
                                        <p>This list is empty.</p>
                                    ) : (
                                        <div>
                                            {list.items.map((item) => (
                                                <RatedItemCard
                                                    key={item.id}
                                                    item={item}
                                                    onRemove={() => removeFromList(list.id, item.id)}
                                                    removeLabel="Remove from list"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
