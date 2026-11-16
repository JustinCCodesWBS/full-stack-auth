import { z } from 'zod/v4';
import { AUTH_API_URL } from '../config';
import { checkResponse, jsonBody, readJson } from './http';

const ACCESS_TOKEN = 'accessToken';
let sessionVersion = 0;
let refreshRequest: Promise<string | null> | undefined;
let logoutRequest: Promise<void> | undefined;

const tokenResponse = z.object({ accessToken: z.string().min(1) });
const profileResponse = z.object({
    id: z.string(),
    email: z.email(),
    roles: z.array(z.string()),
});

export const credentialsSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email({ error: 'Gib eine gültige E-Mail-Adresse ein.' })),
    password: z.string().min(8, { error: 'Das Passwort braucht mindestens 8 Zeichen.' })
        .refine(value => new TextEncoder().encode(value).byteLength <= 72, {
            error: 'Das Passwort darf höchstens 72 UTF-8-Bytes lang sein.',
        }),
});

export type Credentials = z.infer<typeof credentialsSchema>;
export type User = z.infer<typeof profileResponse>;

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN);
}

export function getSessionVersion() {
    return sessionVersion;
}

export function clearAccessToken() {
    sessionVersion++;
    localStorage.removeItem(ACCESS_TOKEN);
}

async function authenticate(path: '/login' | '/register', credentials: Credentials) {
    const response = await fetch(AUTH_API_URL + path, {
        method: 'POST',
        credentials: 'include',
        ...jsonBody(credentials),
    });
    const { accessToken } = await readJson(response, tokenResponse);
    sessionVersion++;
    localStorage.setItem(ACCESS_TOKEN, accessToken);
}

export function login(credentials: Credentials) {
    return authenticate('/login', credentials);
}

export function register(credentials: Credentials) {
    return authenticate('/register', credentials);
}

async function refresh() {
    const session = getSessionVersion();
    const response = await fetch(AUTH_API_URL + '/refresh', {
        method: 'POST',
        credentials: 'include',
    });

    if (response.status === 401) return null;

    const { accessToken } = await readJson(response, tokenResponse);
    if (session !== getSessionVersion()) return null;

    localStorage.setItem(ACCESS_TOKEN, accessToken);
    return accessToken;
}

export function refreshAccessToken() {
    if (logoutRequest) return Promise.resolve(null);
    refreshRequest ??= refresh().finally(() => { refreshRequest = undefined; });
    return refreshRequest;
}

export async function getProfile(request: (url: string) => Promise<Response>) {
    const response = await request(AUTH_API_URL + '/me');
    if (response.status === 401 || response.status === 404) return null;
    return readJson(response, profileResponse);
}

async function endSession() {
    if (refreshRequest) await Promise.allSettled([refreshRequest]);

    const response = await fetch(AUTH_API_URL + '/logout', {
        method: 'DELETE',
        credentials: 'include',
    });
    await checkResponse(response);
    clearAccessToken();
}

export function logout() {
    logoutRequest ??= endSession().finally(() => { logoutRequest = undefined; });
    return logoutRequest;
}
