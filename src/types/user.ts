/** A local app account, as returned by `authService` (never includes the password/hash). */
export interface User {
    id: string;
    username: string;
    email: string;
}
