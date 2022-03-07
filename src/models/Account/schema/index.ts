import { model, Schema } from 'mongoose';
import { ACCOUNT_DETAILS } from 'src/models/AccountDetails/schema';
import { PERSON } from 'src/models/Person/schema';
import { AccountType } from '..';

export const ACCOUNT = 'Account';

const schema = new Schema({
  _id: String,
  nickname: String,
  email: String,
  password: String,
  role: String,
  status: String,
  details: { type: String, ref: ACCOUNT_DETAILS },
  person: { type: String, ref: PERSON },
}, {
  timestamps: true,
});

export const AccountModel = model<AccountType>(ACCOUNT, schema);
