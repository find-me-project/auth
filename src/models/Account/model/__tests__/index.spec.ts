import { faker } from '@faker-js/faker';
import makeAccount, { validatePassword, getEncryptedPassword } from '..';
import { RoleEnum, StatusEnum } from '../..';
import ValidationError from '../../../../util/error/validation-error';

describe('account model', () => {
  describe('validate password', () => {
    it('should validate password', () => {
      expect.assertions(1);

      const password = faker.internet.password(20, false, /\w/, '@2');
      const isValidPassword = validatePassword(password);

      expect(isValidPassword).toBeTruthy();
    });

    it('should throw an exception if password is not provided', () => {
      expect.assertions(1);

      expect(
        () => validatePassword(),
      )
        .toThrow(new ValidationError('PASSWORD_REQUIRED'));
    });

    it('should throw an exception if password has no lower case letters', () => {
      expect.assertions(1);

      expect(
        () => validatePassword('A'),
      )
        .toThrow(new ValidationError('PASSWORD_LOWERCASE_UPPERCASE'));
    });

    it('should throw an exception if password has no upper case letters', () => {
      expect.assertions(1);

      expect(
        () => validatePassword('a'),
      )
        .toThrow(new ValidationError('PASSWORD_LOWERCASE_UPPERCASE'));
    });

    it('should throw an exception if password has no numbers', () => {
      expect.assertions(1);

      expect(
        () => validatePassword('Aa'),
      )
        .toThrow(new ValidationError('PASSWORD_NUMBER'));
    });

    it('should throw an exception if password has no special characters', () => {
      expect.assertions(1);

      expect(
        () => validatePassword('Aa2'),
      )
        .toThrow(new ValidationError('PASSWORD_SPECIAL_CHARACTER'));
    });

    it('should throw an exception if password length < 10', () => {
      expect.assertions(1);

      expect(
        () => validatePassword('Aa2@'),
      )
        .toThrow(new ValidationError('PASSWORD_MIN_LENGTH', { value: 10 }));
    });

    it('should throw an exception if password length > 30', () => {
      expect.assertions(1);

      expect(
        () => validatePassword(faker.internet.password(35, false, /\w/, '@2')),
      )
        .toThrow(new ValidationError('PASSWORD_MAX_LENGTH', { value: 30 }));
    });
  });

  describe('get encrypted password', () => {
    it('should return encrypted password', () => {
      expect.assertions(1);

      const password = faker.internet.password(20, false, /\w/, '@2');
      const result = getEncryptedPassword(password);

      expect(result).toBeDefined();
    });
  });

  describe('make account', () => {
    it('should create a new account', () => {
      expect.assertions(9);

      const account = {
        nickname: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(20, false, /\w/, '@2'),
        person: faker.datatype.uuid(),
      };

      const result = makeAccount(account);

      expect(result._id).toBeDefined();
      expect(result.nickname).toBe(account.nickname.trim());
      expect(result.email).toBe(account.email.trim());
      expect(result.password).toBeDefined();
      expect(result.password).not.toBe(account.password);
      expect(result.details).toBeDefined();
      expect(result.status).toBe(StatusEnum.UNVERIFIED);
      expect(result.role).toBe(RoleEnum.DEFAULT);
      expect(result.person).toBeDefined();
    });

    it('should throw an exception if _id is invalid', () => {
      expect.assertions(1);

      const account = {
        _id: 'invalid_id',
      };

      expect(
        () => makeAccount(account as any),
      )
        .toThrow(new ValidationError('ACCOUNT_ID_INVALID'));
    });

    it('should throw an exception if nickname is not provided', () => {
      expect.assertions(1);

      const account = {
        nickname: undefined,
      };

      expect(
        () => makeAccount(account as any),
      )
        .toThrow(new ValidationError('NICKNAME_REQUIRED'));
    });

    it('should throw an exception if nickname length < 3', () => {
      expect.assertions(1);

      const account = {
        nickname: 'ab',
      };

      expect(
        () => makeAccount(account as any),
      )
        .toThrow(new ValidationError('NICKNAME_MIN_LENGTH', { value: 3 }));
    });

    it('should throw an exception if nickname length > 16', () => {
      expect.assertions(1);

      const account = {
        nickname: faker.lorem.paragraph(),
      };

      expect(
        () => makeAccount(account as any),
      )
        .toThrow(new ValidationError('NICKNAME_MAX_LENGTH', { value: 16 }));
    });

    it('should throw an exception if nickname is invalid', () => {
      expect.assertions(1);

      const account = {
        nickname: 'invalid value !',
      };

      expect(
        () => makeAccount(account as any),
      )
        .toThrow(new ValidationError('NICKNAME_INVALID'));
    });

    it('should throw an exception if nickname is in block list', () => {
      expect.assertions(1);

      const account = {
        nickname: 'Administrador',
      };

      expect(
        () => makeAccount(account as any),
      )
        .toThrow(new ValidationError('NICKNAME_INVALID'));
    });

    it('should throw an exception if email is not provided', () => {
      expect.assertions(1);

      const account = {
        nickname: faker.name.firstName(),
        email: undefined,
      };

      expect(
        () => makeAccount(account as any),
      )
        .toThrow(new ValidationError('EMAIL_REQUIRED'));
    });

    it('should throw an exception if password is not provided', () => {
      expect.assertions(1);

      const account = {
        nickname: faker.name.firstName(),
        email: faker.internet.email(),
        password: undefined,
      };

      expect(
        () => makeAccount(account as any),
      )
        .toThrow(new ValidationError('PASSWORD_REQUIRED'));
    });

    it('should throw an exception if person is not provided', () => {
      expect.assertions(1);

      const account = {
        nickname: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(20, false, /\w/, '@2'),
        person: undefined,
      };

      expect(
        () => makeAccount(account),
      )
        .toThrow(new ValidationError('PERSON_ID_REQUIRED'));
    });
  });
});
