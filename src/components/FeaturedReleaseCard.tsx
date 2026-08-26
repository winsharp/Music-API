import type { DiscogsReleaseDetail } from "../types/discogsRelease";

interface FeaturedReleaseCardProps {
    release: DiscogsReleaseDetail;
    stat: string;
}

const FeaturedReleaseCard = ({ release, stat }: FeaturedReleaseCardProps) => {
    const artist = release.artists?.[0]?.name ?? "Unknown Artist";

    const handleTitleClick = () => {
        // navigate to album/artist detail page once that route exists
        console.log("Clicked:", release.title);
    };

    return (
        <div className="featured-release-card">
            {release.thumb && <img src={release.thumb} alt={release.title} width={80} height={80} />}
            <button type="button" onClick={handleTitleClick}>
                {release.title}
            </button>
            <p className="featured-release-artist">{artist}</p>
            <p className="featured-release-stat">{stat}</p>
        </div>
    );
};

export default FeaturedReleaseCard;
