# Music Rating App - Project Todo

Derived from the initial app flow sketch. Organized by setup phase, page/feature, and user stories. Items marked `(?)` were ambiguous in the original sketch and need a decision before work starts.

---

## 0. Project Setup

- [ ] Initialize repo (React + Local Storage + Third Party API)
- [ ] Choose specific tech stack (React + )
- [ ] Set up database schema for: Users, Songs, Artists, Albums, Genres, Lists, Ratings (Local Storage)
- [ ] Set up auth (register/login with Local Storage)
- [ ] Set up music data source (Third Party API) `(?)` (To Decide)
- [ ] Set up routing/navigation shell (Home, Search, Discover, Profile, Settings)
- [ ] Set up persistent top menu bar (Search + Settings icons, always visible)
- [ ] Define 404 / error page handling
- [ ] Set up CI/basic test scaffolding

---

## 1. Persistent Navigation (Top Menu Bar)

**Note from sketch:** Search & Settings icons live in the menu bar and are persistent across the app. Should be easy to add or remove items later - build this as a configurable nav component, not hardcoded.

- [ ] Build persistent top nav component (config-driven list of icons/links)
- [ ] Add Search icon/entry point
- [ ] Add Settings icon/entry point
- [ ] Ensure nav renders consistently across all pages

**User stories**
- As a user, I want quick access to Search from anywhere in the app so I don't have to return to the Home page first.
- As a user, I want quick access to Settings from anywhere in the app.
- As a developer, I want the nav bar to be config-driven so adding/removing entries doesn't require touching every page.

---

## 2. Home Page

Central hub. Links out to: Genre, Search, Discover, User Profile, Settings.

- [ ] Build Home Page layout
- [ ] Add navigation links/cards to: Genre, Search, Discover, User Profile, Settings
- [ ] Decide what content (if any) lives directly on Home vs. just being a hub e.g. featured songs, recently rated, etc. `(?)` (Probably just a hub)

**User stories**
- As a user, I want a Home page that clearly routes me to Genres, Search, Discover, my Profile, and Settings.
- As a new user, I want the Home page to give me a sense of what the app does at a glance.

---

## 3. Genre -> Artist / Album

- [ ] Build Genre listing page
- [ ] Build Artist listing/detail page (filtered by genre or browsed globally)
- [ ] Build Album listing/detail page (filtered by genre/artist)
- [ ] Link Artist/Album pages through to Song Page
- [ ] Handle empty states (genre with no songs, artist with no albums, etc.)
- [ ] Handle 404 for as a general not found page `(?)`

**User stories**
- As a user, I want to browse songs by genre so I can discover music in a category I like.
- As a user, I want to view an artist's page and see their albums/songs.
- As a user, I want to view an album's page and see its track list.
- As a user, I want to see a clear "not found" page if I follow a broken/invalid link.

---

## 4. Search

- [ ] Build Search page/component
- [ ] Search across all entity types: songs, artists, albums, and genres
- [ ] Search results list, grouped/labeled by type, with links into Song Page / Artist / Album / Genre
- [ ] Handle no-results state

**User stories**
- As a user, I want to search for a song, artist, album, or genre by name.
- As a user, I want search results to clearly indicate whether they're a song, artist, album, or genre.
- As a user, I want a helpful message when my search returns nothing.

---

## 5. Discover

- [ ] Build Discover page
- [ ] Define "trending" logic - likely based on aggregate rating volume/recency across all users (decide exact formula: most-rated recently, highest average rating, etc.)
- [ ] Link discovered songs into Song Page

**User stories**
- As a user, I want a way to find new music I haven't already searched for.
- As a user, I want Discover to show me what's trending across the app right now.

---

## 6. Song Page

Reached from Genre/Artist/Album/Search/Discover.

- [ ] Build Song Page layout
- [ ] Display song info (title, artist, album, genre, etc.)
- [ ] Add Play functionality `(?)` sketch marks this with a "?", confirm whether actual audio playback is in scope or just a link-out/preview
- [ ] Add Rate functionality (rating input + display of existing rating) — **gated behind login**
- [ ] Add "Add to List" functionality (with preset list types, see below) — **gated behind login**
- [ ] Add login-gate UX: if a logged-out user tries to rate or add to a list, prompt them to log in/register (e.g. modal or redirect to Settings login flow), then return them to the Song Page

**User stories**
- As a user, I want to see key info about a song (title, artist, album, genre) without needing an account.
- As a logged-in user, I want to rate a song so I can track what I liked.
- As a logged-out user, if I try to rate a song, I want to be prompted to log in or register rather than silently failing.
- As a logged-in user, I want to add a song to a list (e.g. Favorites, To Listen) directly from its page.
- As a logged-out user, if I try to add a song to a list, I want to be prompted to log in or register.
- As a user, I want to play or preview a song if playback is supported. `(?)`

---

## 7. User Profile

- [ ] Build User Profile page
- [ ] Build Lists section
  - [ ] Support preset list types only: **Favorites** and **To Listen** — custom user-created lists are **out of scope** (May change for later)
  - [ ] Support "Quick Add" - works the same way as adding to Favorites/To Listen (a fast-path shortcut into the same preset lists, not a separate list type)
  - [ ] Allow viewing/removing songs within a list
- [ ] Build "Own Info" section (marked as Extra/optional in sketch lower priority)

**User stories**
- As a user, I want to see all my rated songs and lists in one place (my profile).
- As a user, I want a default "Favorites" list to quickly save songs I love.
- As a user, I want a default "To Listen" list to save songs for later.
- As a user, I want a "Quick Add" option that adds a song to Favorites/To Listen with minimal steps, without needing a separate list type.
- As a user, I want to view my own profile info (bio/details) as a secondary, optional feature.

---

## 8. Settings (marked "Important" in sketch)

Includes Register/Login.

- [ ] Build Register flow
- [ ] Build Login flow
- [ ] Build Account Settings (username, password change)
- [ ] Build Edit Profile (optional, lower priority)
- [ ] Build App Settings (optional, lower priority e.g. theme, notifications)

**Auth policy:** Browsing (Home, Genre, Artist, Album, Search, Discover, Song Page info) is open to everyone. Login is only *enforced* when a user tries to **rate a song** or **create/add to a list**.

**User stories**
- As a new user, I want to register an account so I can save ratings and lists.
- As a returning user, I want to log in to access my saved data.
- As a visitor, I want to browse songs, artists, albums, and search without being forced to log in first.
- As a user, I want to change my username or password from Account Settings.
- As a user, I want to optionally edit my profile details.
- As a user, I want to optionally configure app-level preferences.

---

## 9. Error Handling

- [ ] Build a general 404 / Not Found page
- [ ] Confirm all broken/invalid navigation paths route here (invalid song/artist/album/genre, bad links, etc.)

---

## Open Questions (still unresolved)

1. Does "Play" on the Song Page mean real audio playback, or just a preview/link-out? `(?)`
3. Is "Own Info" on the Profile page truly out of scope for v1 (sketch marks it "Extra")?

**Resolved:**
- ~~What does "hgn" mean~~ - Login. Login is only enforced when rating a song or creating/adding to a list; browsing is open to everyone.
- ~~Discover logic~~ - Based on trending.
- ~~Search scope~~ - Covers all entity types (songs, artists, albums, genres).
- ~~Custom lists~~ - Out of scope. Presets only: Favorites, To Listen. Quick Add works the same way as adding to those presets.
 - ~~What exactly triggers the 404 page~~ - App wide catch all to handle nonexistent pages

---

## Suggested Build Order (MVP-first)

1. Project setup + auth (Register/Login) - needed to gate rating/lists later, but browsing shouldn't depend on it
2. Home Page shell + persistent nav
3. Song Page (info view, open to all) - then Rate + Add to List with login-gating wired in
4. Genre -> Artist -> Album browsing
5. User Profile + Lists (Favorites, To Listen, Quick Add)
6. Search (all entity types)
7. Settings (account, then optional edit profile/app settings)
8. Discover (trending logic)
9. 404/error handling polish
