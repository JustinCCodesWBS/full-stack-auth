import type { RequestHandler } from 'express';
import { drinkParamsSchema } from '../schemas/drinkSchemas.ts';

export const validateDrinkId: RequestHandler<{ id: string }> = (req, _res, next) => {
    const result = drinkParamsSchema.safeParse(req.params);

    if (!result.success) {
        throw result.error;
    }

    next();
};
