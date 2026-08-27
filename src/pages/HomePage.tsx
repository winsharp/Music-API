import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { getFeaturedReleases } from "../services/homeService";
import type { FeaturedReleases } from "../services/homeService";
import FeaturedReleaseSection from "../components/FeaturedReleaseSection";
import "./HomePage.css";

const HomePage = () => {
    // getFeaturedReleases() is a static, local snapshot (see homeService.ts) -
    // it never makes a network call and can't fail, so there's no
    // loading/error state to manage here.
    const [featured, setFeatured] = useState<FeaturedReleases | null>(null);

    useEffect(() => {
        getFeaturedReleases().then(setFeatured);
    }, []);

    return (
        <Container fluid="lg" className="home-page">
            <section id="center" className="text-center py-4">
                <h1>Discover Music</h1>
            </section>

            {featured && (
                <>
                    <FeaturedReleaseSection
                        title="Most Collected"
                        releases={featured.mostCollected}
                        getStat={(release) => `${release.community?.have ?? 0} collectors`}
                    />
                    <FeaturedReleaseSection
                        title="Most Valuable"
                        releases={featured.mostValuable}
                        getStat={(release) =>
                            release.lowest_price != null ? `From $${release.lowest_price.toFixed(2)}` : "No listings"
                        }
                    />
                    <FeaturedReleaseSection
                        title="Best Selling by Week"
                        releases={featured.bestSelling}
                        getStat={(release) => `${release.num_for_sale ?? 0} for sale`}
                    />
                </>
            )}
        </Container>
    );
};

export default HomePage;
