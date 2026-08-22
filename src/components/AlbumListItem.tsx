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
        <tr>
            <td>
                {album.thumb && <img src={album.thumb} alt={title} width={40} height={40} />}
                <button type="button" onClick={handleTitleClick}>
                    {title}
                </button>
            </td>
            <td>{artist}</td>
            <td>{album.year}</td>
            <td>{album.genre && album.genre.length > 0 ? album.genre.join(", ") : ""}</td>
        </tr>
    );
};

export default AlbumListItem;
