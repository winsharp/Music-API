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

    const genreText = album.genre && album.genre.length > 0 ? album.genre.join(", ") : "";
    // Below `sm`, Artist/Year/Genre collapse out of their own columns (too
    // narrow to fit without horizontal scroll) and are summarized here
    // instead, so none of that info is lost on mobile — Artist stays a
    // clickable link like it is in its own column.
    const mobileMetaRest = [album.year, genreText].filter(Boolean).join(" · ");

    return (
        <tr>
            <td>
                <div className="d-flex align-items-center gap-2">
                    {album.thumb && <img src={album.thumb} alt={title} width={40} height={40} />}
                    <div>
                        <Button variant="link" className="p-0 text-start" onClick={handleTitleClick}>
                            {title}
                        </Button>
                        <small className="d-flex d-sm-none align-items-center gap-1 text-muted">
                            {hasKnownArtist ? (
                                <Button
                                    variant="link"
                                    className="p-0 text-muted"
                                    onClick={handleArtistClick}
                                >
                                    {artist}
                                </Button>
                            ) : (
                                artist
                            )}
                            {mobileMetaRest && <span>· {mobileMetaRest}</span>}
                        </small>
                    </div>
                </div>
            </td>
            <td className="d-none d-sm-table-cell">
                {hasKnownArtist ? (
                    <Button variant="link" className="p-0 text-start" onClick={handleArtistClick}>
                        {artist}
                    </Button>
                ) : (
                    artist
                )}
            </td>
            <td className="d-none d-sm-table-cell">{album.year}</td>
            <td className="d-none d-sm-table-cell">{genreText}</td>
        </tr>
    );
};

export default AlbumListItem;
