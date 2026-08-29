// Shared mock SearchResult fixtures, used by browseService/BrowseCatalogPage
// tests to avoid duplicating this data.
import type { SearchResult } from '../types/search';

export const mockBrowseResults: SearchResult[] = [
    {
        id: 101,
        title: 'Pink Floyd - The Dark Side of the Moon',
        year: '1973',
        thumb: 'https://example.com/dark-side.jpg',
        genre: ['Rock'],
        type: 'release',
        resource_url: ''
    },
    {
        id: 102,
        title: 'Miles Davis - Kind of Blue',
        year: '1959',
        thumb: '',
        genre: ['Jazz'],
        type: 'release',
        resource_url: ''
    }
];
