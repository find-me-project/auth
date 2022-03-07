import { model, Schema } from 'mongoose';
import type { PersonType } from '..';

export const PERSON = 'Person';

const schema = new Schema({
  _id: String,
  name: String,
  birthDate: Date,
}, {
  timestamps: true,
});

export const PersonModel = model<PersonType>(PERSON, schema);
