import { faker } from '@faker-js/faker';
import { AccountRepository } from '../../..';
import { AccountDetailsModel } from '../../../../models/AccountDetails/schema';
import { AccountModel } from '../../../../models/Account/schema';
import makeAccount from '../../../../models/Account/model';

describe('account repository', () => {
  const repository = new AccountRepository();
  const accountFindOneSpy = jest.spyOn(AccountModel, 'findOne');

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
});
