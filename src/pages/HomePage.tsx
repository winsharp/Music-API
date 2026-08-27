import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container } from "react-bootstrap";
import { getFeaturedReleases } from "../services/homeService";
import type { FeaturedReleases } from "../services/homeService";
import FeaturedReleaseSection from "../components/FeaturedReleaseSection";
import SearchBox from "../components/SearchBox";
import { useAuth } from "../contexts/AuthContext";
import "./HomePage.css";

const HomePage = () => {
    // getFeaturedReleases() is a static, local snapshot (see homeService.ts) -
    // it never makes a network call and can't fail, so there's no
    // loading/error state to manage here.
    const [featured, setFeatured] = useState<FeaturedReleases | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        getFeaturedReleases().then(setFeatured);
    }, []);

    return (
        <Container fluid="lg" className="home-page">
            <section className="hero-section text-center py-5">
                <p className="hero-eyebrow">Music Rating App</p>
                <h1>Discover Music.</h1>
                <p className="hero-subtitle">
                    Search millions of releases, browse by genre, rate and keep track of what you collect.
                </p>
                <div className="hero-search mx-auto">
                    <SearchBox />
                </div>
                <div className="hero-actions d-flex justify-content-center gap-3">
                    <Button variant="primary" size="lg" onClick={() => navigate("/browse")}>
                        Browse Catalog
                    </Button>
                    {!user && (
                        <Button variant="outline-secondary" size="lg" onClick={() => navigate("/register")}>
                            Sign Up
                        </Button>
                    )}
                </div>
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
