// Shapes for the client-side Discogs OAuth 1.0a handshake.
// NOTE: this signs requests directly from the browser using the app's
// Consumer Secret (PLAINTEXT signature method, as Discogs recommends over
// HTTPS). That means the secret ships in the JS bundle — acceptable for a
// training project, not for a real production app (which should proxy
// these calls through a backend that keeps the secret private).

export interface RequestToken {
    oauthToken: string;
    oauthTokenSecret: string;
}

export interface AccessToken {
    oauthToken: string;
    oauthTokenSecret: string;
}

export interface DiscogsIdentity {
    id: number;
    username: string;
    resource_url: string;
}

// Persisted per app user once they've completed the OAuth flow.
export interface DiscogsConnection {
    discogsUsername: string;
    oauthToken: string;
    oauthTokenSecret: string;
}
