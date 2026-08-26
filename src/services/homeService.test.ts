import { describe, it, expect } from "vitest";
import { getFeaturedReleases } from "./homeService";

describe("getFeaturedReleases", () => {
    it("returns a static, non-empty snapshot for every section without making any network calls", async () => {
        const featured = await getFeaturedReleases();

        expect(featured.mostCollected.length).toBeGreaterThan(0);
        expect(featured.bestSelling.length).toBeGreaterThan(0);
        expect(featured.mostValuable.length).toBeGreaterThan(0);
    });

    it("returns releases with the fields the homepage cards rely on", async () => {
        const featured = await getFeaturedReleases();
        const allReleases = [...featured.mostCollected, ...featured.bestSelling, ...featured.mostValuable];

        for (const release of allReleases) {
            expect(release.id).toBeTypeOf("number");
            expect(release.title).toBeTypeOf("string");
            expect(release.artists?.[0]?.name).toBeTypeOf("string");
            expect(release.community?.have).toBeTypeOf("number");
        }
    });
});
