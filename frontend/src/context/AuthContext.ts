import { createContext, useContext } from 'react';
import type { Credentials, User } from '../data/auth';
import type { AuthRequest } from '../data/fetchWithAuth';

type AuthContextValue = {
    user: User | null;
    signedIn: boolean;
    checkSession: boolean;
    error: string;
    signingIn: boolean;
    signIn: (credentials: Credentials) => Promise<void>;
    signUp: (credentials: Credentials) => Promise<void>;
    signOut: () => Promise<void>;
    request: AuthRequest;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
    const auth = useContext(AuthContext);
    if (!auth) throw new Error('useAuth braucht einen AuthProvider.');
    return auth;
}
