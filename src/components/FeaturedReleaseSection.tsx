import type { DiscogsReleaseDetail } from "../types/discogsRelease";
import FeaturedReleaseCard from "./FeaturedReleaseCard";

interface FeaturedReleaseSectionProps {
    title: string;
    releases: DiscogsReleaseDetail[];
    getStat: (release: DiscogsReleaseDetail) => string;
}

const FeaturedReleaseSection = ({ title, releases, getStat }: FeaturedReleaseSectionProps) => {
    if (!releases.length) return null;

    return (
        <section className="featured-release-section">
            <h2>{title}</h2>
            <div className="featured-release-grid">
                {releases.map((release) => (
                    <FeaturedReleaseCard key={release.id} release={release} stat={getStat(release)} />
                ))}
            </div>
        </section>
    );
};

export default FeaturedReleaseSection;
