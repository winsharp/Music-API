import type { RatedItem } from "../interfaces/ratedItem";

type DisplayItem = Omit<RatedItem, "rating" | "ratedAt"> & Partial<Pick<RatedItem, "rating" | "ratedAt">>;

interface RatedItemCardProps {
    item: DisplayItem;
    onRate?: (rating: number) => void;
    onRemove?: () => void;
    removeLabel?: string;
}

const RatedItemCard = ({ item, onRate, onRemove, removeLabel = "Remove" }: RatedItemCardProps) => {
    return (
        <div>
            {item.thumb && <img src={item.thumb} alt={item.title} />}
            <p>{item.title}</p>

            {onRate && (
                <div>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => onRate(n)}
                            aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                        >
                            {item.rating !== undefined && n <= item.rating ? "★" : "☆"}
                        </button>
                    ))}
                </div>
            )}

            {onRemove && (
                <button type="button" onClick={onRemove}>
                    {removeLabel}
                </button>
            )}
        </div>
    );
};

export default RatedItemCard;
