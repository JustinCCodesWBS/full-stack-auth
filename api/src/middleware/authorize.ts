import type { RequestHandler } from 'express';
import { AccessTokenError } from '../errors/AccessTokenError.ts';
import { DrinkNotFoundError } from '../errors/DrinkNotFoundError.ts';
import { ForbiddenError } from '../errors/ForbiddenError.ts';
import { Drink } from '../models/Drink.ts';

type AuthorizationRule = 'self';

export function authorize(...rules: AuthorizationRule[]): RequestHandler<{ id: string }> {
    return async (req, _res, next) => {
        const user = req.user;

        if (!user) {
            throw new AccessTokenError('ACCESS_TOKEN_REQUIRED', 'Ein Bearer-Token ist erforderlich.');
        }

        if (user.roles.includes('admin')) {
            next();
            return;
        }

        if (rules.includes('self')) {
            const drink = await Drink.findById(req.params.id).select('ownerId');

            if (!drink) {
                throw new DrinkNotFoundError();
            }

            if (drink.ownerId?.toHexString() === user.id) {
                next();
                return;
            }
        }

        throw new ForbiddenError();
    };
}
