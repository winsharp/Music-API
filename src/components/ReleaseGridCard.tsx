import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import MediaCard from "./MediaCard";
import type { DiscogsBasicInformation } from "../types/discogsUser";

export interface ReleaseGridCardItem {
    rating: number;
    basic_information: DiscogsBasicInformation;
}

interface ReleaseGridCardProps {
    item: ReleaseGridCardItem;
    /** Show the 0-5 star rating (and a "Not rated" label when it's 0). */
    showRating?: boolean;
}

/**
 * A MediaCard configured for a Discogs collection/wantlist release: clicking
 * the card navigates to the release page, and clicking the artist name (when
 * known) navigates to that artist instead. Used anywhere a grid of a user's
 * releases is shown (profile sections, "View All" pages).
 */
const ReleaseGridCard = ({ item, showRating = false }: ReleaseGridCardProps) => {
    const navigate = useNavigate();
    const artistName = item.basic_information.artists?.[0]?.name;

    const handleArtistClick = (e: React.MouseEvent) => {
        // Stop the click from bubbling up to the surrounding card, which
        // navigates to the release instead.
        e.stopPropagation();
        if (artistName) navigate(`/artist?name=${encodeURIComponent(artistName)}`);
    };

    return (
        <MediaCard
            thumb={item.basic_information.thumb}
            alt={item.basic_information.title}
            title={item.basic_information.title}
            onClick={() => navigate(`/release/${item.basic_information.id}`)}
        >
            {artistName && (
                <Button
                    variant="link"
                    className="p-0 text-start d-block mb-1 media-card-subtitle"
                    onClick={handleArtistClick}
                >
                    {artistName}
                </Button>
            )}
            {showRating && (
                <div>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <span key={n} aria-hidden="true">
                            {item.rating >= n ? "★" : "☆"}
                        </span>
                    ))}
                    {item.rating === 0 && <span> Not rated</span>}
                </div>
            )}
        </MediaCard>
    );
};

export default ReleaseGridCard;
