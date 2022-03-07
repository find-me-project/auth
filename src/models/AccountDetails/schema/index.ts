import { model, Schema } from 'mongoose';
import { AccountDetailsType } from '..';

export const ACCOUNT_DETAILS = 'Account_details';

export const accountDetailsSchema = new Schema({
  _id: String,
  emailUpdatedAt: Date,
  lastSignIn: Date,
  recoverCode: String,
  recoverCodeDate: Date,
  activationDate: Date,
  activationCode: String,
  activationCodeDate: Date,
  countFailedActivationAttempts: Number,
  countFailedRecoveryAttempts: Number,
  countFailedSignInAttempts: Number,
  lastFailedSignInAttemptDate: Number,
});

export const AccountDetailsModel = model<AccountDetailsType>(ACCOUNT_DETAILS, accountDetailsSchema);
