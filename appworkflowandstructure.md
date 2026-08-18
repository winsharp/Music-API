# Feature Branch Structure

Each feature should be developed in its own Git branch.

A feature branch can contain everything necessary to implement that feature, including:

Feature
├── Page
├── Components
├── Types
├── Services
└── Other supporting files

For example, an album rating feature might use:

feat/album-rating


src/
├── pages/
│   └── AlbumPage.tsx
├── components/
│   └── RatingForm.tsx
├── types/
│   └── rating.ts
└── services/
    └── ratingService.ts

The important idea is that the branch represents the feature, not an individual file or component.

# Git Workflow

Note: Avoid Pushing into Main Directly, use this workflow to deal with individual features

1) Create a branch for the feature
With the naming conventions 
feat/name-of-feature
ex. feat/album-rating

2) Develop the entire feature on that branch
Add pages
Add components
Add types
Add services/API calls

3) Commit using the conventional commit convention "feat: add album rating functionality"

feat: add album rating functionality


4) Finish and test the feature before merging

5) Push the feature branch

```git push -u origin feat/album-rating```

6) Create a Pull Request into main

```feat/album-rating → main```

7) Require at least one other team member to review the PR

The reviewer should check both the code and functionality. For larger features, this can include pulling the branch and running the application locally.

8) Merge into main after approval

# Feature File Structure
When working on a feature, organize the code based on what each file is responsible for. A feature may require a page, multiple components, types, services, tests, and other supporting files.

```
src/
├── pages/
├── components/
├── types/
├── services/
└── ...
```

## pages/ — Full Pages / Routes

Contains the main page components that users navigate to.

A page typically brings together several smaller components to create a complete screen.

```
pages/
├── CollectionPage.tsx
├── AlbumPage.tsx
└── ProfilePage.tsx
```

Example: AlbumPage.tsx could display the album information, the user's rating, reviews, and tracks.

## components/ — Reusable UI

Contains smaller pieces of the user interface that can be used inside pages or other components.

components/
├── AlbumCard.tsx
├── RatingInput.tsx
├── ReviewCard.tsx
└── Navbar.tsx

Example: AlbumCard.tsx could be reused on the collection page, profile page, and search results.

Rule of thumb:
A page represents a screen. A component represents a piece of that screen.

## types/ — TypeScript Types

Contains shared TypeScript types and interfaces that describe the shape of the application's data.

types/
├── album.ts
├── artist.ts
├── rating.ts
└── user.ts

For example:

export interface Album {
  id: string;
  title: string;
  artist: string;
  releaseYear: number;
}

This allows different parts of the application to agree on what an Album should look like.

# services/ — API / External Data

Contains code responsible for communicating with APIs or other external services.

services/
├── albumService.ts
├── ratingService.ts
└── userService.ts

Instead of making API requests directly inside a component:

const response = await axios.get("/api/albums");

you can place that logic in:

// albumService.ts


export const getAlbums = async () => {
  // API request
};

The component can then call:

const albums = await getAlbums();

This keeps API logic separate from UI logic.

# tests/ or *.test.tsx — Tests (Optional in adding to feature branch)

Contains tests that verify that components and application logic behave correctly.

components/
├── AlbumCard.tsx
└── AlbumCard.test.tsx

For example, a Vitest test could verify that AlbumCard correctly displays an album's title and rating.
