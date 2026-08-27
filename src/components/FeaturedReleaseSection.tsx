import { Row } from "react-bootstrap";
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
            <Row xs={2} sm={3} md={4} lg={6} className="g-3">
                {releases.map((release) => (
                    <FeaturedReleaseCard key={release.id} release={release} stat={getStat(release)} />
                ))}
            </Row>
        </section>
    );
};

export default FeaturedReleaseSection;
