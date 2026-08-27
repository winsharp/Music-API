import type { ReactNode } from "react";
import { Button, Card } from "react-bootstrap";
import "../styles/mediaThumb.css";

interface MediaCardProps {
    thumb?: string;
    alt: string;
    title: ReactNode;
    onClick?: () => void;
    children?: ReactNode;
}

/**
 * Shared layout for the media (album/release) thumbnail cards used across
 * search results, the home page, and profile sections — keeps the image
 * treatment, title, and body spacing consistent no matter how many columns
 * a given grid uses. The title and the cover art are both click targets for
 * the same release (like links), not the whole card, so they don't compete
 * with other interactive content (e.g. the artist link) inside the card.
 * Extra per-context content (artist link, rating stars, genre badges,
 * stats, ...) is passed in as children.
 */
const MediaCard = ({ thumb, alt, title, onClick, children }: MediaCardProps) => (
    <Card className="h-100">
        {thumb ? (
            <div className={onClick ? "media-thumb-link" : undefined} onClick={onClick} role={onClick ? "button" : undefined}>
                <Card.Img variant="top" className="media-thumb" src={thumb} alt={alt} />
            </div>
        ) : (
            <div
                className={onClick ? "media-thumb media-thumb-placeholder media-thumb-link" : "media-thumb media-thumb-placeholder"}
                onClick={onClick}
                role={onClick ? "button" : undefined}
            />
        )}
        <Card.Body className="p-2">
            {onClick ? (
                <Button
                    variant="link"
                    className="p-0 text-start d-block mb-1 media-card-title-link"
                    onClick={onClick}
                >
                    <span className="media-card-title">{title}</span>
                </Button>
            ) : (
                <p className="mb-1 media-card-title">{title}</p>
            )}
            {children}
        </Card.Body>
    </Card>
);

export default MediaCard;
