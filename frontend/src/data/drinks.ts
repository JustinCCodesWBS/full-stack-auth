import { z } from 'zod/v4';
import { DRINKS_API_URL } from '../config';
import type { AuthRequest } from './fetchWithAuth';
import { checkResponse, jsonBody, readJson } from './http';

const drinkSchema = z.object({
    _id: z.string(),
    name: z.string(),
    onMenu: z.boolean(),
    ownerId: z.string().optional(),
});

export const drinkNameSchema = z.string().trim().min(1, { error: 'Gib einen Namen für den Drink ein.' });

export type Drink = z.infer<typeof drinkSchema>;

export async function listDrinks(signal: AbortSignal) {
    return readJson(await fetch(DRINKS_API_URL, { signal }), z.array(drinkSchema));
}

function drinkUrl(id: string) {
    return `${DRINKS_API_URL}/${encodeURIComponent(id)}`;
}

export async function getDrink(id: string, signal: AbortSignal) {
    return readJson(await fetch(drinkUrl(id), { signal }), drinkSchema);
}

export async function createDrink(request: AuthRequest, name: string) {
    const response = await request(DRINKS_API_URL, { method: 'POST', ...jsonBody({ name }) });
    return readJson(response, drinkSchema);
}

export async function updateDrink(request: AuthRequest, id: string, onMenu: boolean) {
    const response = await request(drinkUrl(id) + '/menu', { method: 'PATCH', ...jsonBody({ onMenu }) });
    return readJson(response, drinkSchema);
}

export async function deleteDrink(request: AuthRequest, id: string) {
    await checkResponse(await request(drinkUrl(id), { method: 'DELETE' }));
}
