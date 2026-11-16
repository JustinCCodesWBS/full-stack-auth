import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
    clearAccessToken, getAccessToken, getProfile, getSessionVersion, login,
    logout, refreshAccessToken, register, type Credentials, type User,
} from '../data/auth';
import { fetchWithAuth, type AuthRequest } from '../data/fetchWithAuth';
import { errorMessage } from '../data/http';
import { AuthContext } from './AuthContext';

async function loadUser() {
    const token = getAccessToken() ?? await refreshAccessToken();
    if (!token) return null;

    return getProfile(fetchWithAuth);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [checkSession, setCheckSession] = useState(true);
    const [error, setError] = useState('');
    const [signingIn, setSigningIn] = useState(false);
    const authPending = useRef(false);

    useEffect(() => {
        if (!checkSession) return;
        let active = true;

        async function restoreSession() {
            try {
                const profile = await loadUser();
                if (!active) return;
                if (!profile && getAccessToken()) clearAccessToken();
                setUser(profile);
                setError('');
            } catch (error) {
                if (active) setError(errorMessage(error));
            } finally {
                if (active) setCheckSession(false);
            }
        }

        void restoreSession();
        return () => { active = false; };
    }, [checkSession]);

    async function authenticate(action: typeof login, credentials: Credentials) {
        if (authPending.current) return;

        authPending.current = true;
        setSigningIn(true);
        try {
            await action(credentials);
            setError('');
            setCheckSession(true);
        } finally {
            authPending.current = false;
            setSigningIn(false);
        }
    }

    async function signOut() {
        await logout();
        setUser(null);
        setError('');
    }

    const request: AuthRequest = async (url, options) => {
        const session = getSessionVersion();
        const response = await fetchWithAuth(url, options);
        if (response.status === 401 && session === getSessionVersion()) {
            clearAccessToken();
            setUser(null);
            setError('Melde dich erneut an, um weiterzumachen.');
        }
        return response;
    };

    return (
        <AuthContext.Provider value={{
            user, signedIn: user !== null, checkSession, error, signingIn, request,
            signIn: credentials => authenticate(login, credentials),
            signUp: credentials => authenticate(register, credentials),
            signOut,
        }}>
            {children}
        </AuthContext.Provider>
    );
}
