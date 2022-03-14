import { faker } from '@faker-js/faker';
import { AccountRepository } from '../../..';
import { AccountDetailsModel } from '../../../../models/AccountDetails/schema';
import { AccountModel } from '../../../../models/Account/schema';
import makeAccount from '../../../../models/Account/model';
import { AccountDetailsType } from '../../../../models/AccountDetails';

describe('account repository', () => {
  const repository = new AccountRepository();
  const accountFindOneSpy = jest.spyOn(AccountModel, 'findOne');
  const accountDetailsUpdateOneSpy = jest.spyOn(AccountDetailsModel, 'updateOne');
  const accountUpdateOneSpy = jest.spyOn(AccountModel, 'updateOne');
  const accountFindOneAndUpdateSpy = jest.spyOn(AccountModel, 'findOneAndUpdate');

  describe('create', () => {
    it('should create a new account', async () => {
      expect.assertions(2);

      jest.spyOn(AccountDetailsModel.prototype, 'save').mockResolvedValueOnce(null);
      jest.spyOn(AccountModel.prototype, 'save').mockResolvedValueOnce(null);
      jest.spyOn(AccountModel.prototype, 'populate').mockResolvedValueOnce(null);
      jest.spyOn(AccountModel.prototype, 'toJSON').mockResolvedValueOnce({ password: 'password', details: 'details' });

      const account = makeAccount({
        nickname: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(20, false, /\w/, '@2'),
        person: faker.datatype.uuid(),
      });
      const result = await repository.create(account);

      expect(result.password).toBeUndefined();
      expect(result.details).toBeUndefined();
    });
  });

  describe('exists by email', () => {
    it('should return true if the account exists', async () => {
      expect.assertions(1);

      jest.spyOn(AccountModel, 'exists').mockResolvedValueOnce({ _id: faker.datatype.uuid() } as any);

      const result = await AccountRepository.existsByEmail(faker.internet.email());

      expect(result).toBeTruthy();
    });

    it('should return false if the account not exists', async () => {
      expect.assertions(1);

      jest.spyOn(AccountModel, 'exists').mockResolvedValueOnce(null);

      const result = await AccountRepository.existsByEmail(faker.internet.email());

      expect(result).toBeFalsy();
    });
  });

  describe('exists by nickname', () => {
    it('should return true if the account exists', async () => {
      expect.assertions(1);

      jest.spyOn(AccountModel, 'exists').mockResolvedValueOnce({ _id: faker.datatype.uuid() } as any);

      const result = await AccountRepository.existsByNickName(faker.name.firstName());

      expect(result).toBeTruthy();
    });

    it('should return false if the account not exists', async () => {
      expect.assertions(1);

      jest.spyOn(AccountModel, 'exists').mockResolvedValueOnce(null);

      const result = await AccountRepository.existsByNickName(faker.name.firstName());

      expect(result).toBeFalsy();
    });
  });

  describe('exists by id', () => {
    it('should return true if the account exists', async () => {
      expect.assertions(1);

      jest.spyOn(AccountModel, 'exists').mockResolvedValueOnce({ _id: faker.datatype.uuid() } as any);

      const result = await AccountRepository.existsById(faker.datatype.uuid());

      expect(result).toBeTruthy();
    });

    it('should return false if the account not exists', async () => {
      expect.assertions(1);

      jest.spyOn(AccountModel, 'exists').mockResolvedValueOnce(null);

      const result = await AccountRepository.existsById(faker.datatype.uuid());

      expect(result).toBeFalsy();
    });
  });

  describe('get by id', () => {
    it('should return account', async () => {
      expect.assertions(2);
      const id = faker.datatype.uuid();

      accountFindOneSpy.mockImplementationOnce((): any => ({
        populate: jest.fn().mockImplementationOnce(() => ({
          populate: jest.fn().mockImplementationOnce(() => ({
            exec: jest.fn().mockResolvedValueOnce({ _id: id } as any),
          })),
        })),
      }));

      const result = await repository.getById(id);

      expect(result).toBeDefined();
      expect(result).toStrictEqual({ _id: id });
    });

    it('should return null if account not found', async () => {
      expect.assertions(1);
      const id = faker.datatype.uuid();

      accountFindOneSpy.mockImplementationOnce((): any => ({
        populate: jest.fn().mockImplementationOnce(() => ({
          populate: jest.fn().mockImplementationOnce(() => ({
            exec: jest.fn().mockResolvedValueOnce(null),
          })),
        })),
      }));

      const result = await repository.getById(id);

      expect(result).toBeNull();
    });
  });

  describe('get by email', () => {
    it('should return account', async () => {
      expect.assertions(2);
      const id = faker.datatype.uuid();

      accountFindOneSpy.mockImplementationOnce((): any => ({
        populate: jest.fn().mockImplementationOnce(() => ({
          populate: jest.fn().mockImplementationOnce(() => ({
            exec: jest.fn().mockResolvedValueOnce({ _id: id } as any),
          })),
        })),
      }));

      const result = await repository.getByEmail(faker.internet.email());

      expect(result).toBeDefined();
      expect(result).toStrictEqual({ _id: id });
    });

    it('should return null if account not found', async () => {
      expect.assertions(1);
      const email = faker.internet.email();

      accountFindOneSpy.mockImplementationOnce((): any => ({
        populate: jest.fn().mockImplementationOnce(() => ({
          populate: jest.fn().mockImplementationOnce(() => ({
            exec: jest.fn().mockResolvedValueOnce(null),
          })),
        })),
      }));

      const result = await repository.getByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('get by nickname', () => {
    it('should return account', async () => {
      expect.assertions(2);
      const id = faker.datatype.uuid();

      accountFindOneSpy.mockImplementationOnce((): any => ({
        populate: jest.fn().mockImplementationOnce(() => ({
          populate: jest.fn().mockImplementationOnce(() => ({
            exec: jest.fn().mockResolvedValueOnce({ _id: id } as any),
          })),
        })),
      }));

      const result = await repository.getByNickname(faker.name.firstName());

      expect(result).toBeDefined();
      expect(result).toStrictEqual({ _id: id });
    });

    it('should return null if account not found', async () => {
      expect.assertions(1);
      const nickname = faker.name.firstName();

      accountFindOneSpy.mockImplementationOnce((): any => ({
        populate: jest.fn().mockImplementationOnce(() => ({
          populate: jest.fn().mockImplementationOnce(() => ({
            exec: jest.fn().mockResolvedValueOnce(null),
          })),
        })),
      }));

      const result = await repository.getByNickname(nickname);

      expect(result).toBeNull();
    });
  });

  describe('change activation code', () => {
    it('should change account activation code', async () => {
      expect.assertions(1);

      const id = faker.datatype.uuid();
      const code = '01234567';

      const account = makeAccount({
        nickname: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(20, false, /\w/, '@2'),
        person: faker.datatype.uuid(),
      });

      jest.spyOn(repository, 'getById').mockResolvedValueOnce(account);
      accountDetailsUpdateOneSpy.mockImplementationOnce((): any => ({
        exec: jest.fn(),
      }));

      await repository.changeActivationCode(id, code);

      expect(accountDetailsUpdateOneSpy).toHaveBeenCalledTimes(1);

      accountDetailsUpdateOneSpy.mockReset();
    });
  });

  describe('activate', () => {
    it('should activate user account', async () => {
      expect.assertions(2);

      const id = faker.datatype.uuid();
      const account = makeAccount({
        nickname: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(20, false, /\w/, '@2'),
        person: faker.datatype.uuid(),
      });

      jest.spyOn(repository, 'getById').mockResolvedValueOnce(account);
      accountUpdateOneSpy.mockImplementationOnce((): any => ({
        exec: jest.fn(),
      }));
      accountDetailsUpdateOneSpy.mockImplementationOnce((): any => ({
        exec: jest.fn(),
      }));

      await repository.activate(id);

      expect(accountUpdateOneSpy).toHaveBeenCalledTimes(1);
      expect(accountDetailsUpdateOneSpy).toHaveBeenCalledTimes(1);

      accountUpdateOneSpy.mockReset();
      accountDetailsUpdateOneSpy.mockReset();
    });
  });

  describe('increase fail activation', () => {
    it('should increase account failed activation', async () => {
      expect.assertions(1);

      const id = faker.datatype.uuid();
      const account = makeAccount({
        nickname: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(20, false, /\w/, '@2'),
        person: faker.datatype.uuid(),
      });

      jest.spyOn(repository, 'getById').mockResolvedValueOnce(account);

      accountDetailsUpdateOneSpy.mockImplementationOnce((): any => ({
        exec: jest.fn(),
      }));

      await repository.increaseFailActivation(id);

      expect(accountDetailsUpdateOneSpy).toHaveBeenCalledTimes(1);

      accountDetailsUpdateOneSpy.mockReset();
    });
  });

  describe('update password', () => {
    it('should update account password', async () => {
      expect.assertions(1);

      accountUpdateOneSpy.mockImplementationOnce((): any => ({
        exec: jest.fn(),
      }));

      const id = faker.datatype.uuid();
      const password = faker.internet.password(20, false, /\w/, '@2');

      await repository.updatePassword(id, password);

      expect(accountUpdateOneSpy).toHaveBeenCalledTimes(1);

      accountUpdateOneSpy.mockReset();
    });
  });

  describe('request recover password', () => {
    it('request recover password - update recover code', async () => {
      expect.assertions(1);

      const id = faker.datatype.uuid();
      const code = '01234567';
      const account = makeAccount({
        nickname: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(20, false, /\w/, '@2'),
        person: faker.datatype.uuid(),
      });

      jest.spyOn(repository, 'getById').mockResolvedValueOnce(account);

      accountDetailsUpdateOneSpy.mockImplementationOnce((): any => ({
        exec: jest.fn(),
      }));

      await repository.requestRecoverPassword(id, code);

      expect(accountDetailsUpdateOneSpy).toHaveBeenCalledTimes(1);

      accountDetailsUpdateOneSpy.mockReset();
    });
  });

  describe('increase failed recover password', () => {
    it('should increase failed recover password attempts', async () => {
      expect.assertions(1);

      const id = faker.datatype.uuid();
      const account = makeAccount({
        nickname: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(20, false, /\w/, '@2'),
        person: faker.datatype.uuid(),
      });

      jest.spyOn(repository, 'getById').mockResolvedValueOnce(account);

      accountDetailsUpdateOneSpy.mockImplementationOnce((): any => ({
        exec: jest.fn(),
      }));

      await repository.increaseFailedRecoverPassword(id);

      expect(accountDetailsUpdateOneSpy).toHaveBeenCalledTimes(1);

      accountDetailsUpdateOneSpy.mockReset();
    });
  });

  describe('recover password', () => {
    it('should recover account password', async () => {
      expect.assertions(2);

      const id = faker.datatype.uuid();
      const account = makeAccount({
        nickname: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(20, false, /\w/, '@2'),
        person: faker.datatype.uuid(),
      });

      accountFindOneAndUpdateSpy.mockImplementationOnce((): any => ({
        exec: jest.fn().mockResolvedValueOnce({ ...account, details: (account.details as AccountDetailsType)._id }),
      }));
      accountDetailsUpdateOneSpy.mockImplementationOnce((): any => ({
        exec: jest.fn(),
      }));

      await repository.recoverPassword(id, account.password!);

      expect(accountFindOneAndUpdateSpy).toHaveBeenCalledTimes(1);
      expect(accountDetailsUpdateOneSpy).toHaveBeenCalledTimes(1);

      accountFindOneAndUpdateSpy.mockReset();
      accountDetailsUpdateOneSpy.mockReset();
    });
  });

  describe('increase failed sign in', () => {
    it('should increase failed sign in attempts', async () => {
      expect.assertions(1);

      const id = faker.datatype.uuid();
      const account = makeAccount({
        nickname: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(20, false, /\w/, '@2'),
        person: faker.datatype.uuid(),
      });

      jest.spyOn(repository, 'getById').mockResolvedValueOnce(account);
      accountDetailsUpdateOneSpy.mockImplementationOnce((): any => ({
        exec: jest.fn(),
      }));

      await repository.increaseFailedSignIn(id);

      expect(accountDetailsUpdateOneSpy).toHaveBeenCalledTimes(1);

      accountDetailsUpdateOneSpy.mockReset();
    });
  });

  describe('save last sign in', () => {
    it('should save last sign in', async () => {
      expect.assertions(1);

      const id = faker.datatype.uuid();
      const account = makeAccount({
        nickname: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(20, false, /\w/, '@2'),
        person: faker.datatype.uuid(),
      });

      jest.spyOn(repository, 'getById').mockResolvedValueOnce(account);
      accountDetailsUpdateOneSpy.mockImplementationOnce((): any => ({
        exec: jest.fn(),
      }));

      await repository.saveLastSignIn(id);

      expect(accountDetailsUpdateOneSpy).toHaveBeenCalledTimes(1);

      accountDetailsUpdateOneSpy.mockReset();
    });
  });
});
