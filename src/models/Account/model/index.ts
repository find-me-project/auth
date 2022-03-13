import { genSaltSync, hashSync } from 'bcrypt';
import makeAccountDetails from 'src/models/AccountDetails/model';
import ValidationError from 'src/util/error/validation-error';
import { uuidValidateV4 } from 'src/util/uuid';
import { v4 as uuidv4 } from 'uuid';
import { AccountType, RoleEnum, StatusEnum } from '..';
import blockList from './util/block-list';

/**
 * Validate the user password strength and return a encrypted password
 *
 * @param {string} password - User password
 */
export function validatePassword (password?: string): boolean {
  if (!password) {
    throw new ValidationError('PASSWORD_REQUIRED');
  }

  if (!password.match(/[a-z]/g) || !password.match(/[A-Z]/g)) {
    throw new ValidationError('PASSWORD_LOWERCASE_UPPERCASE');
  }
  if (!password.match(/\d+/g)) {
    throw new ValidationError('PASSWORD_NUMBER');
  }
  if (!password.match(/[^A-z\s\d][\\^ _]?/g)) {
    throw new ValidationError('PASSWORD_SPECIAL_CHARACTER');
  }
  if (password.length < 10) {
    throw new ValidationError('PASSWORD_MIN_LENGTH', { value: 10 });
  }
  if (password.length > 30) {
    throw new ValidationError('PASSWORD_MAX_LENGTH', { value: 30 });
  }

  return true;
}

export function getEncryptedPassword (password: string): string {
  return hashSync(password, genSaltSync(10));
}

/**
 * Make a account
 *
 * @param account - Account data
 * @returns readonly account object type
 */
export default function makeAccount (account: AccountType): Readonly<AccountType> {
  if (account._id && !uuidValidateV4(account._id)) {
    throw new ValidationError('ACCOUNT_ID_INVALID');
  }

  if (!account.nickname) {
    throw new ValidationError('NICKNAME_REQUIRED');
  }
  if (account.nickname.trim().length < 3) {
    throw new ValidationError('NICKNAME_MIN_LENGTH', { value: 3 });
  }
  if (account.nickname.trim().length > 16) {
    throw new ValidationError('NICKNAME_MAX_LENGTH', { value: 16 });
  }
  if (!account.nickname.trim().match(/^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,16}$/gi)) {
    throw new ValidationError('NICKNAME_INVALID');
  }
  if (blockList.find((name: string) => name.toLowerCase() === account.nickname!.toLowerCase())) {
    throw new ValidationError('NICKNAME_INVALID');
  }

  if (!account.email) {
    throw new ValidationError('EMAIL_REQUIRED');
  }

  let { password } = account;
  if (!account._id) {
    validatePassword(password);
    password = getEncryptedPassword(password!);
  }

  if (!account.person) {
    throw new ValidationError('PERSON_ID_REQUIRED');
  }

  return Object.freeze({
    _id: account._id || uuidv4(),
    nickname: account.nickname.trim(),
    email: account.email!.trim(),
    password: password,
    details: makeAccountDetails({}),
    status: StatusEnum.UNVERIFIED,
    role: RoleEnum.DEFAULT,
    person: account.person,
  });
}
