import { faker } from '@faker-js/faker';
import {
  describe, it, expect, jest,
} from '@jest/globals';
import { PersonRepository } from '../../..';
import { AccountModel } from '../../../../models/Account/schema';
import makePerson from '../../../../models/Person/model';
import { PersonModel } from '../../../../models/Person/schema';

describe('person repository', () => {
  const repository = new PersonRepository();
  const personFindOneAndUpdateSpy = jest.spyOn(PersonModel, 'findOneAndUpdate');
  const accountFindOneSpy = jest.spyOn(AccountModel, 'findOne');

  describe('create', () => {
    it('should create a new person', async () => {
      expect.assertions(3);

      const person = makePerson({
        name: faker.name.firstName(),
        birthDate: new Date('2000-01-01'),
      });

      jest.spyOn(PersonModel.prototype, 'save').mockReturnValueOnce(null);
      jest.spyOn(PersonModel.prototype, 'toJSON').mockReturnValueOnce(person);

      const result = await repository.create(person);

      expect(result._id).toBeDefined();
      expect(result.name).toBe(person.name);
      expect(result.birthDate).toBe(person.birthDate);
    });
  });

  describe('update', () => {
    it('should update person', async () => {
      expect.assertions(4);

      const person = makePerson({
        _id: faker.datatype.uuid(),
        name: faker.name.firstName(),
        birthDate: new Date('2000-01-01'),
      });

      personFindOneAndUpdateSpy.mockImplementationOnce((): any => ({
        exec: jest.fn().mockImplementationOnce(() => ({
          toJSON: jest.fn().mockReturnValueOnce(person),
        })),
      }));

      const result = await repository.update(person);

      expect(result._id).toBe(person._id);
      expect(result.name).toBe(person.name);
      expect(result.birthDate).toBe(person.birthDate);
      expect(personFindOneAndUpdateSpy).toHaveBeenCalledTimes(1);

      personFindOneAndUpdateSpy.mockReset();
    });
  });

  describe('get account', () => {
    it('should return account by person id', async () => {
      expect.assertions(3);

      const id = faker.datatype.uuid();
      const accountId = faker.datatype.uuid();

      accountFindOneSpy.mockImplementationOnce((): any => ({
        exec: jest.fn().mockImplementationOnce(() => ({
          toJSON: jest.fn().mockReturnValueOnce({ _id: accountId }),
        })),
      }));

      const result = await repository.getAccount(id);

      expect(result).toBeDefined();
      expect(result!._id).toBe(accountId);
      expect(accountFindOneSpy).toHaveBeenCalledTimes(1);

      accountFindOneSpy.mockReset();
    });

    it('should return null if account not found', async () => {
      expect.assertions(2);

      const id = faker.datatype.uuid();

      accountFindOneSpy.mockImplementationOnce((): any => ({
        exec: jest.fn().mockReturnValueOnce(null),
      }));

      const result = await repository.getAccount(id);

      expect(result).toBeNull();
      expect(accountFindOneSpy).toHaveBeenCalledTimes(1);

      accountFindOneSpy.mockReset();
    });
  });

  describe('exists by id', () => {
    it('should return true if the person exists', async () => {
      expect.assertions(1);

      const id = faker.datatype.uuid();
      jest.spyOn(PersonModel, 'exists').mockReturnValueOnce({ _id: id } as any);

      const result = await PersonRepository.existsById(id);

      expect(result).toBeTruthy();
    });

    it('should return false if the person not exists', async () => {
      expect.assertions(1);

      const id = faker.datatype.uuid();
      jest.spyOn(PersonModel, 'exists').mockReturnValueOnce(null as any);

      const result = await PersonRepository.existsById(id);

      expect(result).toBeFalsy();
    });
  });
});
