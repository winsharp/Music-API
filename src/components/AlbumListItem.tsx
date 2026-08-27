import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import type { SearchResult } from "../types/search";
import { parseAlbumTitle } from "../utils/parseAlbumTitle";

interface AlbumListItemProps {
    album: SearchResult;
}

const AlbumListItem = ({ album }: AlbumListItemProps) => {
    const { artist, title } = parseAlbumTitle(album.title);
    const navigate = useNavigate();
    // parseAlbumTitle falls back to this literal string when a search
    // result's title has no "Artist - Title" separator to split on — not a
    // real artist to look up on Discogs, so don't make it clickable.
    const hasKnownArtist = artist !== "Unknown Artist";

    const handleTitleClick = () => {
        navigate(`/release/${album.id}`);
    };

    const handleArtistClick = () => {
        navigate(`/artist?name=${encodeURIComponent(artist)}`);
    };

    return (
        <tr>
            <td>
                <div className="d-flex align-items-center gap-2">
                    {album.thumb && <img src={album.thumb} alt={title} width={40} height={40} />}
                    <Button variant="link" className="p-0 text-start" onClick={handleTitleClick}>
                        {title}
                    </Button>
                </div>
            </td>
            <td>
                {hasKnownArtist ? (
                    <Button variant="link" className="p-0 text-start" onClick={handleArtistClick}>
                        {artist}
                    </Button>
                ) : (
                    artist
                )}
            </td>
            <td>{album.year}</td>
            <td>{album.genre && album.genre.length > 0 ? album.genre.join(", ") : ""}</td>
        </tr>
    );
};

export default AlbumListItem;
