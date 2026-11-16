import { Router } from 'express';
import { credentialsSchema } from '../schemas/authSchemas.ts';
import { login, logout, me, refresh, register } from '../controllers/authController.ts';
import { requireAccessToken } from '../middleware/requireAccessToken.ts';
import { validateBody } from '../middleware/validateBody.ts';

export const authRoutes = Router();

authRoutes.post('/register', validateBody(credentialsSchema), register);
authRoutes.post('/login', validateBody(credentialsSchema), login);
authRoutes.post('/refresh', refresh);
authRoutes.get('/me', requireAccessToken, me);
authRoutes.delete('/logout', logout);
