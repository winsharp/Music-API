# Music API

Music API is a React + TypeScript single-page app that lets users browse, search, and explore a real music catalog (powered by the [Discogs](https://www.discogs.com/developers) API), rate and collect releases, and build a public profile around their music taste.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Data / "Database" Design](#data--database-design)
- [API Endpoints](#api-endpoints)
- [Installation](#installation)
- [Execution](#execution)
- [Testing](#testing)
- [Known Limitations](#known-limitations)
- [Team Member Contributions](#team-member-contributions)

## Project Overview

Users can:

- Browse and search the Discogs release catalog by title, genre, and style.
- View detailed artist and release (album) pages, including tracklists and artist discographies.
- Register/log in to a local account, then link their own Discogs account via OAuth.
- Rate releases and add them to their Discogs collection or wantlist directly from the app.
- View any user's public profile — their Discogs collection and wantlist — and manage their own account settings.

Browsing (home, search, browse catalog, artist, and release pages) is open to everyone. Logging in is only required to rate a release or add it to a collection/wantlist, since those actions write to a real Discogs account.

## Features

- **Home page** — curated "Most Collected," "Most Valuable," and "Best Selling" release sections, plus quick entry points into search and browse.
- **Search** — full-text search across the Discogs release catalog, with genre filtering and pagination.
- **Browse catalog** — explore releases by genre and style without needing a search query.
- **Artist pages** — artist profile info and their discography, resolved from either a release's artist name or a direct artist id.
- **Release (album) pages** — full release detail: tracklist, year, genres/styles, credited artists.
- **Accounts** — register/log in with a local username + password (bcrypt-hashed); session persists across reloads.
- **Discogs account linking** — connect a real Discogs account via OAuth 1.0a to enable write actions.
- **Rate & collect** — rate a release (0–5) and add/remove it from your linked Discogs collection or wantlist.
- **Profiles** — view any user's public Discogs collection and wantlist by username; manage your own account in Settings.
- **Route guarding** — `ProtectedRoute`/`GuestRoute` keep account-only pages behind login and keep logged-in users out of the login/register screens.
- **Loading states** — skeleton components for catalog tables, grids, and profile/release detail while data loads.

## Architecture

The app is a client-only React SPA — there is no custom backend server. It talks directly to the public Discogs REST API for all music data, and uses the browser's `localStorage`/`sessionStorage` for its own lightweight user accounts and session state.

```
src/
├── pages/        Route-level screens (Home, Search, Browse, Artist, Release, Profile, Settings, Auth...)
├── components/   Reusable UI building blocks (NavBar, cards, filters, route guards, skeletons...)
├── contexts/     React context providers (AuthContext for the current logged-in user)
├── hooks/        Reusable hooks (useAuth, useAsyncStatus, useDiscogsConnection, usePageParam)
├── services/     All outbound data access — Discogs API calls + localStorage-backed services
├── types/        Shared TypeScript types/interfaces for API and domain data
├── constants/    Static lookup data (genres, styles)
├── utils/        Small helper functions
└── tests/        MSW mock handlers/fixtures and Vitest setup used across the test suite
```

Key architectural pieces:

- **Routing** — `src/App.tsx` defines all routes with `react-router-dom`. `ProtectedRoute` redirects logged-out users away from account-only pages (profile, settings, Discogs callback); `GuestRoute` does the opposite for login/register.
- **Auth** — `AuthContext` (in `contexts/`) wraps the whole app and exposes the current user via the `useAuth` hook. Session state is backed by `authService`, which persists users/sessions in `localStorage`.
- **Discogs integration** — `services/discogs*.ts` handle the read-only public API calls (search, browse, artist/release detail, user profiles) as well as the client-side OAuth 1.0a handshake needed to act on behalf of a user's real Discogs account (rating, collecting, wantlisting).
- **UI** — Built with React Bootstrap + custom CSS, following the branch/feature file structure documented in [`appworkflowandstructure.md`](appworkflowandstructure.md) (one feature per branch, organized into `pages/`, `components/`, `types/`, `services/`).

## Technologies Used

- **React 19** + **TypeScript** — UI and application logic
- **Vite** (with the React Compiler babel preset) — dev server and build tooling
- **React Router 7** — client-side routing and route guards
- **React Bootstrap 5 / Bootstrap 5** — UI components and styling
- **Axios** — HTTP client for all Discogs API calls
- **bcryptjs** — password hashing for local account credentials
- **Discogs API** (OAuth 1.0a + token auth) — external data source for the entire music catalog
- **Vitest** + **@testing-library/user-event** + **jsdom** — unit/component testing
- **MSW (Mock Service Worker)** — mocks Discogs API responses in tests
- **ESLint** + **typescript-eslint** — linting

## Data / "Database" Design

This project has no dedicated backend database. Data lives in two places:

### 1. Browser storage (the app's own data)

All keys are namespaced with a `music-api:` prefix.

| Storage | Key | Shape | Purpose |
|---|---|---|---|
| `localStorage` | `music-api:users` | `{ id, username, email, passwordHash }[]` | All registered local accounts. Passwords are hashed with bcrypt (`authService.ts`) — plaintext passwords are never stored. |
| `localStorage` | `music-api:session` | user `id` string | The currently logged-in user's id; drives `AuthContext`/`useAuth`. |
| `localStorage` | `music-api:discogs-auth:<userId>` | `DiscogsConnection` (`discogsUsername`, `oauthToken`, `oauthTokenSecret`) | Each local account's linked Discogs OAuth credentials, kept independent of the app's own login session. |
| `sessionStorage` | `music-api:discogs-pending-request-token` | `RequestToken` | Transient OAuth request token held only between redirecting to Discogs and returning to `/discogs/callback`. |

`services/authService.ts` and `services/discogsAuthStorage.ts` are the only modules that read/write these keys directly — everything else goes through them.

### 2. Discogs API (the music catalog)

All artist, release, and catalog data is fetched live from Discogs — the app does not mirror or cache this data beyond a short in-memory TTL cache (`services/discogsUserCache.ts`) used to avoid redundant refetching when navigating between a profile and its sub-sections.

A user's Discogs **collection** and **wantlist** are also owned entirely by Discogs, not this app — the app just reads/writes them via authenticated API calls once a user connects their account.

## API Endpoints

The app is a consumer of the [Discogs API](https://www.discogs.com/developers), not a provider of its own REST API. The main endpoints it calls (see `src/services/`) are:

| Endpoint | Used by | Purpose |
|---|---|---|
| `GET /database/search` | `searchService`, `browseService`, `artistService` | Search/browse releases by query, genre, and style; resolve an artist name to an id |
| `GET /releases/{id}` | `releaseService` | Full release detail (year, genres, tracklist, artists) |
| `GET /artists/{id}` | `artistService` | Artist profile |
| `GET /artists/{id}/releases` | `artistService` | An artist's discography |
| `GET /users/{username}` | `discogsUserService` | Public user profile |
| `GET /users/{username}/collection/folders/0/releases` | `discogsUserService` | A user's public collection |
| `GET /users/{username}/collection/releases/{releaseId}` | `releaseCollectionService` | Check if a release already exists in the current user's collection |
| `POST /users/{username}/collection/folders/1/releases/{releaseId}` | `releaseCollectionService` | Add a release to the current user's collection |
| `POST /users/{username}/collection/folders/1/releases/{releaseId}/instances/{instanceId}` | `releaseCollectionService` | Rate a release already in the collection |
| `GET /users/{username}/wants` | `discogsUserService` | A user's wantlist |
| `PUT /users/{username}/wants/{releaseId}` | `wantlistService` | Add a release to the wantlist |
| `DELETE /users/{username}/wants/{releaseId}` | `wantlistService` | Remove a release from the wantlist |
| `GET /oauth/request_token`, `GET /oauth/access_token`, `GET /oauth/identity` | `discogsOAuthService` | Client-side OAuth 1.0a handshake to link a user's Discogs account |

Endpoints under `/users/*` and the collection/wantlist mutation endpoints require the request to be signed with either the app's own Discogs personal access token (public data) or a linked user's OAuth token (private data / write actions).

## Installation

**Prerequisites:** Node.js and npm.

1. Clone the repository and install dependencies:

   ```bash
   npm ci
   ```

2. Copy the example environment file and fill in your own Discogs credentials:

   ```bash
   cp .env.example .env
   ```

   ```env
   VITE_DISCOGS_BASE_URL=https://api.discogs.com
   VITE_DISCOGS_TOKEN=your_discogs_personal_access_token
   VITE_DISCOGS_CONSUMER_KEY=your_discogs_consumer_key
   VITE_DISCOGS_CONSUMER_SECRET=your_discogs_consumer_secret
   ```

   Get a personal access token and register an app (for the consumer key/secret) at [discogs.com/settings/developers](https://www.discogs.com/settings/developers).

   > **Note:** the OAuth consumer secret ships in the client bundle with this setup, which is acceptable for a training project but not for production — a real deployment should proxy Discogs OAuth through a backend instead.

## Execution

Start the dev server:

```bash
npm run dev
```

Then open `http://localhost:5173`.

Other scripts:

```bash
npm run build    # type-check and build for production
npm run preview  # preview the production build locally
npm run lint     # run ESLint
```

## Testing

Tests are written with Vitest and React Testing Library, with Mock Service Worker (MSW) mocking Discogs API responses so tests don't hit the real network.

```bash
npm run test
```

Test files live next to the code they cover (e.g. `NavBar.tsx` / `NavBar.test.tsx`) and mock data/handlers live in `src/tests/`.

## Known Limitations

- **No real backend / accounts aren't portable.** Local accounts, sessions, and Discogs-connection links live only in the current browser's `localStorage` — they don't sync across devices/browsers and are wiped if site data is cleared.
- **OAuth consumer secret ships client-side.** The Discogs OAuth 1.0a flow is implemented entirely in the browser, which means `VITE_DISCOGS_CONSUMER_SECRET` is bundled into the client. This is an accepted tradeoff for a training project, not something to reuse in production — a real deployment should proxy the OAuth handshake through a backend.
- **Home page stats are a static snapshot**, not live data. Discogs has no "trending"/charts endpoint, and calling `GET /releases/{id}` for every featured release on each visit isn't practical, so `homeService.ts` ships a hand-picked, hardcoded set of releases with stats captured on 2026-08-26 — they will drift out of date over time.
- **No custom/user-created lists.** Only Discogs' own collection and wantlist are supported; there's no app-specific list feature (e.g. custom playlists).
- **Ambiguous artist name resolution.** Resolving a catalog row's artist name to a Discogs artist id (`findArtistIdByName`) just takes the first search match, so artists sharing a name (which Discogs itself disambiguates with suffixes like "Rush (2)") can occasionally resolve to the wrong profile.
- **Subject to Discogs API rate limits.** All catalog/search/profile data depends on Discogs' public API and its per-token rate limiting; heavy usage can result in throttled requests.
- **No audio playback.** The app links out to release/artist data only — there is no in-app track preview or playback.

## Team Member Contributions

| Team Member | GitHub | Contributions |
|---|---|---|
| Angel | [@angeljudediones-arch](https://github.com/angeljudediones-arch) | Home page, user profile, login/register, Discogs OAuth integration, settings, tests, peer reviews |
| Winona | [@winsharp](https://github.com/winsharp) | Album (release) page, browse catalog feature, tests, peer reviews |
| Heriberto | [@betohhh707](https://github.com/betohhh707) | Search feature, profile mock data, tests, peer reviews |

