// Service file that powers the homepage's "Most Collected" / "Most Valuable" /
// "Best Selling by Week" sections.
//
// Discogs' public API has no global charts endpoint for any of these, and no
// per-release endpoint that's cheap enough to call live for a curated list
// on every homepage load either - each release's community/marketplace stats
// only exist on GET /releases/{id}, one call per release. To keep the
// homepage from firing 18 API requests on every visit, this is a fully
// static snapshot: real release ids + their real stats, captured directly
// from the Discogs API on 2026-08-26. Refresh the numbers below periodically
// (or swap back to a live GET /releases/{id} call per id) if they go stale.
//
// The releases themselves were chosen from Discogs' own published data:
//   - Most Collected: Discogs' 2024 "most collected" report (Taylor Swift's
//     "The Tortured Poets Department" topped it) plus its all-time most
//     collected master (Pink Floyd's "The Dark Side of the Moon") and most
//     collected individual release (Daft Punk's "Random Access Memories").
//   - Best Selling by Week: the Official Charts Company's 2024 best-selling
//     vinyl albums list (the closest real analog to weekly sales rankings -
//     Discogs doesn't expose sales-by-week data itself).
//   - Most Valuable: albums frequently referenced in Discogs' "most
//     expensive records" Digs articles, shown with their current listing
//     stats at snapshot time.

import type { DiscogsReleaseDetail } from "../types/discogsRelease";

export interface FeaturedReleases {
    mostCollected: DiscogsReleaseDetail[];
    mostValuable: DiscogsReleaseDetail[];
    bestSelling: DiscogsReleaseDetail[];
}

const MOST_COLLECTED: DiscogsReleaseDetail[] = [
    {
        id: 9287809,
        title: "The Dark Side Of The Moon",
        thumb: "https://i.discogs.com/sVLIxn9GSzw4lpSDt2YnmRMfTbMN1CrAkfjo0M7-ckk/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTkyODc4/MDktMTQ3OTc1MzIz/Ni05NjE3LmpwZWc.jpeg",
        year: 2016,
        artists: [{ name: "Pink Floyd" }],
        community: { have: 77062, want: 9825 },
        lowest_price: 29.75,
        num_for_sale: 117,
    },
    {
        id: 4570366,
        title: "Random Access Memories",
        thumb: "https://i.discogs.com/rqE3sfigR3-tErFq1l1AV_4XYDHpjNV6PwD0EcENccM/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTQ1NzAz/NjYtMTc0OTM3MjMx/Ny0xODg1LmpwZWc.jpeg",
        year: 2013,
        artists: [{ name: "Daft Punk" }],
        community: { have: 84230, want: 31012 },
        lowest_price: 28,
        num_for_sale: 119,
    },
    {
        id: 30444731,
        title: "The Tortured Poets Department",
        thumb: "https://i.discogs.com/yItq-WkhxKTj4GDbnGCGAx5LURUIk2fANNhBQp2CYrE/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTMwNDQ0/NzMxLTE3MTM1NTEy/NDgtNzkxOC5qcGVn.jpeg",
        year: 2024,
        artists: [{ name: "Taylor Swift" }],
        community: { have: 29285, want: 965 },
        lowest_price: 10,
        num_for_sale: 153,
    },
    {
        id: 30891144,
        title: "Brat",
        thumb: "https://i.discogs.com/Ft21hD1op7eJI1gBZdACEZDwhazLqDexmL--rz--kkc/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTMwODkx/MTQ0LTE3MjcwNjgz/ODctMzU4OS5qcGVn.jpeg",
        year: 2024,
        artists: [{ name: "Charli XCX" }],
        community: { have: 15604, want: 2648 },
        lowest_price: 24,
        num_for_sale: 122,
    },
    {
        id: 30696067,
        title: "Hit Me Hard And Soft",
        thumb: "https://i.discogs.com/T3RfDbKDIZx-7YJe-1vj7yM9WutjPU9GpHABDNKWrwI/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTMwNjk2/MDY3LTE3MTYyMDU2/NTAtODE3Ny5qcGVn.jpeg",
        year: 2024,
        artists: [{ name: "Billie Eilish" }],
        community: { have: 24625, want: 2153 },
        lowest_price: 17.99,
        num_for_sale: 87,
    },
    {
        id: 526351,
        title: "Rumours",
        thumb: "https://i.discogs.com/ZizBH8T2kqJBsxQk1FF5QUaoqnTn0xgNP9ITYX5bCw8/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTUyNjM1/MS0xMjkyMjkzNjg1/LmpwZWc.jpeg",
        year: 1977,
        artists: [{ name: "Fleetwood Mac" }],
        community: { have: 66612, want: 18389 },
        lowest_price: 15.48,
        num_for_sale: 82,
    },
];

const BEST_SELLING: DiscogsReleaseDetail[] = [
    {
        id: 5697791,
        title: "Definitely Maybe",
        thumb: "https://i.discogs.com/4Bb9zU7mPI5qX7u3AYM3GMsdfwCg-7AsYjSkKcxPL1k/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTU2OTc3/OTEtMTQxMTA0OTUy/Ni0zMjYwLmpwZWc.jpeg",
        year: 2014,
        artists: [{ name: "Oasis (2)" }],
        community: { have: 31255, want: 4488 },
        lowest_price: 33.8,
        num_for_sale: 109,
    },
    {
        id: 28365832,
        title: "The Rise And Fall Of A Midwest Princess",
        thumb: "https://i.discogs.com/gdV3hGeO68yneKtomP5WSQR6RUnsxexCJ0hs1U2jN9I/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTI4MzY1/ODMyLTE2OTU0MjAx/MjgtNTEwMC5qcGVn.jpeg",
        year: 2023,
        artists: [{ name: "Chappell Roan" }],
        community: { have: 18244, want: 3095 },
        lowest_price: 20,
        num_for_sale: 79,
    },
    {
        id: 31556044,
        title: "Short N' Sweet",
        thumb: "https://i.discogs.com/B5Q8sPagcMlvz_Lbueuwdkj3bHBChJSAIZeTc4M2Mus/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTMxNTU2/MDQ0LTE3MjQ5NzE1/NzctNzg1My5qcGVn.jpeg",
        year: 2024,
        artists: [{ name: "Sabrina Carpenter" }],
        community: { have: 19318, want: 2027 },
        lowest_price: 23.26,
        num_for_sale: 32,
    },
    {
        id: 31541038,
        title: "Romance",
        thumb: "https://i.discogs.com/LgEqDvKTw7yVOvwHwJCKrpabRK6jBsRl-kM3FcxUCD0/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTMxNTQx/MDM4LTE3MjY2ODM5/NDUtNjAyMi5qcGVn.jpeg",
        year: 2024,
        artists: [{ name: "Fontaines D.C." }],
        community: { have: 17077, want: 1858 },
        lowest_price: 23.98,
        num_for_sale: 179,
    },
    {
        id: 32156865,
        title: "Songs Of A Lost World",
        thumb: "https://i.discogs.com/GcTq-Rfz7qO0iWGOhOK5RWspyIYcK_qYkx6xZWMSaqw/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTMyMTU2/ODY1LTE3MzE2ODEz/OTAtMjQwNi5qcGVn.jpeg",
        year: 2024,
        artists: [{ name: "The Cure" }],
        community: { have: 9146, want: 645 },
        lowest_price: 25.69,
        num_for_sale: 168,
    },
    {
        id: 31902511,
        title: "Moon Music",
        thumb: "https://i.discogs.com/52H2yG2cpbW4WdQN1qJy7wskpYdjurduJfwYmdmg2aw/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTMxOTAy/NTExLTE3Mjg2Mzc4/MTAtNzUyNy5qcGVn.jpeg",
        year: 2024,
        artists: [{ name: "Coldplay" }],
        community: { have: 6991, want: 404 },
        lowest_price: 24.3,
        num_for_sale: 122,
    },
];

const MOST_VALUABLE: DiscogsReleaseDetail[] = [
    {
        id: 231557,
        title: "The Black Album",
        thumb: "https://i.discogs.com/SoqTv7jwXgUxIDHz7xmKDwb6zXbHLMGOAxOSsZ-8dv0/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTIzMTU1/Ny0xNTExNTIxMDMw/LTMxODcuanBlZw.jpeg",
        year: 1994,
        artists: [{ name: "Prince" }],
        community: { have: 3810, want: 488 },
        lowest_price: 12.16,
        num_for_sale: 102,
    },
    {
        id: 2911293,
        title: "Thriller",
        thumb: "https://i.discogs.com/YUg3KtvrYJxfN6sI2FtFkxDcsNQeMhObLOEvNSCcqLs/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTI5MTEy/OTMtMTUxNjE0NDE1/NC01NDk5LmpwZWc.jpeg",
        year: 1982,
        artists: [{ name: "Michael Jackson" }],
        community: { have: 66546, want: 17015 },
        lowest_price: 3.04,
        num_for_sale: 88,
    },
    {
        id: 9269057,
        title: "Abbey Road",
        thumb: "https://i.discogs.com/xAD52buN0rzqRf4hRVOWJVAtiaP7CCoOkHX4hSOLcHg/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTkyNjkw/NTctMTYyNzk5NDE3/Ni0yMzUxLmpwZWc.jpeg",
        year: 2016,
        artists: [{ name: "The Beatles" }],
        community: { have: 17519, want: 2876 },
        lowest_price: 33.01,
        num_for_sale: 19,
    },
    {
        id: 7097051,
        title: "Nevermind",
        thumb: "https://i.discogs.com/O3ojGjG-2BnKqOOIL-d8dDURFom2Se-cYgIBIKev1Ak/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTcwOTcw/NTEtMTU1NjQ0NDE4/MC03NTA1LmpwZWc.jpeg",
        year: 2015,
        artists: [{ name: "Nirvana" }],
        community: { have: 76677, want: 13221 },
        lowest_price: 19.48,
        num_for_sale: 223,
    },
    {
        id: 6916342,
        title: "The Rise And Fall Of Ziggy Stardust And The Spiders From Mars",
        thumb: "https://i.discogs.com/oR-ckkJ_BqJVhrUKuKXlzYye5Tz6f-wBgrGdMYEK_J8/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTY5MTYz/NDItMTQyOTQ0NjMz/Ni03MjkyLmpwZWc.jpeg",
        year: 2001,
        artists: [{ name: "David Bowie" }],
        community: { have: 372, want: 853 },
        lowest_price: null,
        num_for_sale: 0,
    },
    {
        id: 1587168,
        title: "OK Computer",
        thumb: "https://i.discogs.com/kR8i2ZRSUafJyLczI4VWHDwiCSxTuQa9xPsx0uCWwCI/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTE1ODcx/NjgtMTY0NzQ0NTg0/My00ODU0LmpwZWc.jpeg",
        year: 2008,
        artists: [{ name: "Radiohead" }],
        community: { have: 22818, want: 11033 },
        lowest_price: 10,
        num_for_sale: 28,
    },
];

/**
 * Returns the curated "Most Collected" / "Most Valuable" / "Best Selling"
 * lists for the homepage. No network calls at all — this is a static
 * snapshot (see the module-level comment above for why, and how to refresh
 * it).
 */
export const getFeaturedReleases = async (): Promise<FeaturedReleases> => {
    return {
        mostCollected: MOST_COLLECTED,
        bestSelling: BEST_SELLING,
        mostValuable: MOST_VALUABLE,
    };
};
