import { getAccessToken, getSessionVersion, refreshAccessToken } from './auth';
import { readApiError } from './http';

export type AuthRequest = (url: string, options?: RequestInit) => Promise<Response>;

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = getAccessToken();
    const session = getSessionVersion();

    async function send(accessToken: string | null) {
        const headers = new Headers(options.headers);
        if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

        const response = await fetch(url, { ...options, headers });
        if (getSessionVersion() !== session) throw new Error('Die Sitzung hat sich geändert.');

        return response;
    }

    const response = await send(token);
    if (response.status !== 401) return response;

    const error = await readApiError(response.clone());
    if (!token || error.code !== 'ACCESS_TOKEN_EXPIRED') return response;

    if (getSessionVersion() !== session) throw new Error('Die Sitzung hat sich geändert.');

    const currentToken = getAccessToken();
    const freshToken = currentToken === token ? await refreshAccessToken() : currentToken;
    if (getSessionVersion() !== session) throw new Error('Die Sitzung hat sich geändert.');

    return freshToken ? send(freshToken) : response;
}
