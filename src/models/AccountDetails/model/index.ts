import randomCode from 'src/util/code/random-code';
import ValidationError from 'src/util/error/validation-error';
import { uuidValidateV4 } from 'src/util/uuid';
import { v4 as uuidv4 } from 'uuid';
import type { AccountDetailsType } from '..';

export default function makeAccountDetails (data: AccountDetailsType): Readonly<AccountDetailsType> {
  if (data._id && !uuidValidateV4(data._id)) {
    throw new ValidationError('ID_INVALID');
  }

  return Object.freeze({
    _id: data._id || uuidv4(),
    emailUpdatedAt: data.emailUpdatedAt,
    lastSignIn: data.lastSignIn,
    recoverCode: data.recoverCode,
    recoverCodeDate: data.recoverCodeDate,
    activationDate: data.activationDate,
    activationCode: !data._id ? randomCode(8) : data.activationCode,
    activationCodeDate: !data._id ? new Date() : data.activationCodeDate,
    countFailedActivationAttempts: data.countFailedActivationAttempts,
    countFailedRecoveryAttempts: data.countFailedRecoveryAttempts,
    countFailedSignInAttempts: data.countFailedSignInAttempts,
    lastFailedSignInAttemptDate: data.lastFailedSignInAttemptDate,
  });
}
