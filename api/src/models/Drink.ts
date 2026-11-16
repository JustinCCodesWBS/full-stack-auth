import { Schema, model } from 'mongoose';

const drinkSchema = new Schema({
    name: { type: String, required: true },
    onMenu: { type: Boolean, default: false },
    ownerId: { type: Schema.Types.ObjectId, required: true, immutable: true },
});

export const Drink = model('Drink', drinkSchema, 'drinks');
