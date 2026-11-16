import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod/v4';
import { AccessTokenError } from '../errors/AccessTokenError.ts';
import { config } from '../config.ts';

const secret = config.ACCESS_TOKEN_SECRET;

const accessClaimsSchema = z.object({
    sub: z.string().regex(/^[a-f0-9]{24}$/i),
    roles: z.array(z.string()),
    exp: z.number(),
});

export const requireAccessToken: RequestHandler = (req, _res, next) => {
    const token = req.get('Authorization')?.match(/^Bearer +(\S+)$/i)?.[1];

    if (!token) {
        throw new AccessTokenError('ACCESS_TOKEN_REQUIRED', 'Ein Bearer-Token ist erforderlich.');
    }

    let decoded: unknown;
    try {
        decoded = jwt.verify(token, secret, {
            algorithms: ['HS256'],
            issuer: 'drinks-auth',
            audience: 'drinks-api',
        });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new AccessTokenError('ACCESS_TOKEN_EXPIRED', 'Access Token ist abgelaufen.');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new AccessTokenError('ACCESS_TOKEN_INVALID', 'Access Token ist ungültig.');
        }
        throw error;
    }

    const claims = accessClaimsSchema.safeParse(decoded);
    if (!claims.success) {
        throw new AccessTokenError('ACCESS_TOKEN_INVALID', 'Access Token ist ungültig.');
    }

    req.user = { id: claims.data.sub, roles: claims.data.roles };
    next();
};
