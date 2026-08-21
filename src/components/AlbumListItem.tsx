import type { SearchResult } from "../types/search";
import { parseAlbumTitle } from "../utils/parseAlbumTitle";

interface AlbumListItemProps {
    album: SearchResult;
}

const AlbumListItem = ({ album }: AlbumListItemProps) => {
    const { artist, title } = parseAlbumTitle(album.title);

    const handleTitleClick = () => {
        // navigate to album detail page once that route exists
        console.log("Clicked:", album.title);
    };

    return (
        <div>
            {album.thumb && <img src={album.thumb} alt={title} />}
            <button type="button" onClick={handleTitleClick}>
                <h3>{title}</h3>
            </button>
            <p>{artist}</p>
            <p>{album.year}</p>
            {album.genre && album.genre.length > 0 && <p>{album.genre.join(", ")}</p>}
        </div>
    );
};

export default AlbumListItem;
