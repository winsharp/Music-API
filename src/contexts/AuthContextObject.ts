import { createContext } from "react";
import type { AuthContextValue } from "../types/AuthContextValue";

// Split into its own file (rather than living in AuthContext.tsx) so that
// AuthContext.tsx exports only the AuthProvider component and hooks/useAuth.ts
// exports only the useAuth hook — Fast Refresh only works reliably when a
// file exports just components (or just hooks/constants), not a mix.
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
