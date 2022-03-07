import { isValid } from 'date-fns';
import ValidationError from 'src/util/error/validation-error';
import type { TokenBlacklistType } from '..';

export default function makeTokenBlacklist (token: TokenBlacklistType): Readonly<TokenBlacklistType> {
  if (!token._id) {
    throw new ValidationError('TOKEN_ID_REQUIRED');
  }
  if (!token.revocationDate) {
    throw new ValidationError('TOKEN_REVOCATION_DATE_REQUIRED');
  }
  if (!isValid(token.revocationDate)) {
    throw new ValidationError('TOKEN_REVOCATION_DATE_INVALID');
  }

  return Object.freeze({
    _id: token._id,
    revocationDate: token.revocationDate,
  });
}
