//data file to prevent code duplication
import type { SearchResult } from '../types/search';

export const mockSearchResults: SearchResult[] = [
    {
        id: 1,
        title: 'The Dark Side of the Moon',
        year: '1973',
        thumb: 'https://example.com',
        genre: ['Rock', 'Psychedelic Rock'],
        type: "",
        resource_url: ""
    },
    {
        id: 2,
        title: 'Abbey Road',
        year: '1969',
        thumb: '',
        genre: ['Rock', 'Pop'],
        type: "",
        resource_url: ""
    }
];