import { z } from 'zod/v4';

const apiErrorSchema = z.object({
    message: z.string(),
    code: z.string().optional(),
});

export async function readApiError(response: Response) {
    const result = apiErrorSchema.safeParse(await response.json().catch(() => null));
    return result.success ? result.data : { message: `Anfrage fehlgeschlagen (HTTP ${response.status}).` };
}

export async function checkResponse(response: Response) {
    if (!response.ok) {
        const error = await readApiError(response);
        throw new Error(response.status < 500 ? error.message : 'Der Server konnte die Anfrage nicht verarbeiten.');
    }
}

export async function readJson<T>(response: Response, schema: z.ZodType<T>): Promise<T> {
    await checkResponse(response);
    const result = schema.safeParse(await response.json().catch(() => null));
    if (!result.success) throw new Error('Der Server hat eine unerwartete Antwort gesendet.');
    return result.data;
}

export function errorMessage(error: unknown) {
    if (error instanceof TypeError) return 'Der Server ist gerade nicht erreichbar.';
    return error instanceof Error ? error.message : 'Die Anfrage ist fehlgeschlagen.';
}

export function jsonBody(body: object) {
    return {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    };
}
