export type AccountDetailsType = {
  _id?: string,
  emailUpdatedAt?: Date,
  lastSignIn?: Date,
  recoverCode?: string,
  recoverCodeDate?: Date,
  activationDate?: Date,
  activationCode?: string,
  activationCodeDate?: Date,
  countFailedActivationAttempts?: number,
  countFailedRecoveryAttempts?: number,
  countFailedSignInAttempts?: number,
  lastFailedSignInAttemptDate?: Date,
};
