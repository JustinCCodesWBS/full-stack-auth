import { Router } from 'express';
import {
    listDrinks,
    getDrink,
    addDrink,
    updateDrinkMenu,
    deleteDrink,
} from '../controllers/drinkController.ts';
import { authorize } from '../middleware/authorize.ts';
import { preventCaching } from '../middleware/preventCaching.ts';
import { requireAccessToken } from '../middleware/requireAccessToken.ts';
import { validateBody } from '../middleware/validateBody.ts';
import { validateDrinkId } from '../middleware/validateDrinkId.ts';
import {
    createDrinkSchema,
    updateDrinkMenuSchema,
} from '../schemas/drinkSchemas.ts';

export const drinkRoutes = Router();

drinkRoutes.use(preventCaching);

drinkRoutes.get('/', listDrinks);
drinkRoutes.get('/:id', validateDrinkId, getDrink);
drinkRoutes.post('/', requireAccessToken, validateBody(createDrinkSchema), addDrink);
drinkRoutes.patch(
    '/:id/menu',
    requireAccessToken,
    validateDrinkId,
    authorize('self'),
    validateBody(updateDrinkMenuSchema),
    updateDrinkMenu,
);
drinkRoutes.delete('/:id', requireAccessToken, validateDrinkId, authorize('self'), deleteDrink);
