import { faker } from '@faker-js/faker';
import {
  describe, it, expect, jest,
} from '@jest/globals';
import { PersonService } from '../..';
import { PersonRepository } from '../../../repositories';
import { StatusEnum } from '../../../models/Account';
import ValidationError from '../../../util/error/validation-error';

describe('person service', () => {
  const service = new PersonService();

  describe('create', () => {
    it('should create a new person', async () => {
      expect.assertions(2);

      const person = {
        name: faker.name.firstName(),
        birthDate: new Date('2000-01-01'),
      };
      const personCreateSpy = jest.spyOn(PersonRepository.prototype, 'create').mockResolvedValueOnce(person);

      const result = await service.create(person);

      expect(result).toStrictEqual(result);
      expect(personCreateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update the person', async () => {
      expect.assertions(4);

      const person = {
        _id: faker.datatype.uuid(),
        name: faker.name.firstName(),
        birthDate: new Date('2000-01-01'),
      };
      const personUpdateSpy = jest.spyOn(PersonRepository.prototype, 'update').mockResolvedValueOnce(person);
      const personExistsByIdSpy = jest.spyOn(PersonRepository, 'existsById').mockResolvedValueOnce(true);
      const personGetAccountSpy = jest.spyOn(PersonRepository.prototype, 'getAccount').mockResolvedValueOnce({
        status: StatusEnum.VERIFIED,
      } as any);

      const result = await service.update(person);

      expect(result).toStrictEqual(result);
      expect(personUpdateSpy).toHaveBeenCalledTimes(1);
      expect(personExistsByIdSpy).toHaveBeenCalledTimes(1);
      expect(personGetAccountSpy).toHaveBeenCalledTimes(1);

      personUpdateSpy.mockReset();
      personExistsByIdSpy.mockReset();
      personGetAccountSpy.mockReset();
    });

    it('should throw an error if person not found', async () => {
      expect.assertions(3);

      const person = {
        _id: faker.datatype.uuid(),
        name: faker.name.firstName(),
        birthDate: new Date('2000-01-01'),
      };
      const personUpdateSpy = jest.spyOn(PersonRepository.prototype, 'update');
      const personExistsByIdSpy = jest.spyOn(PersonRepository, 'existsById').mockResolvedValueOnce(false);

      const result = service.update(person);

      await expect(result).rejects.toThrow(new ValidationError('PERSON_NOT_FOUND'));
      expect(personUpdateSpy).toHaveBeenCalledTimes(0);
      expect(personExistsByIdSpy).toHaveBeenCalledTimes(1);

      personUpdateSpy.mockReset();
      personExistsByIdSpy.mockReset();
    });

    it('should throw an error if person account not found', async () => {
      expect.assertions(4);

      const person = {
        _id: faker.datatype.uuid(),
        name: faker.name.firstName(),
        birthDate: new Date('2000-01-01'),
      };
      const personUpdateSpy = jest.spyOn(PersonRepository.prototype, 'update');
      const personExistsByIdSpy = jest.spyOn(PersonRepository, 'existsById').mockResolvedValueOnce(true);
      const personGetAccountSpy = jest.spyOn(PersonRepository.prototype, 'getAccount').mockResolvedValueOnce(null as any);

      const result = service.update(person);

      await expect(result).rejects.toThrow(new ValidationError('ACCOUNT_NOT_FOUND'));
      expect(personUpdateSpy).toHaveBeenCalledTimes(0);
      expect(personExistsByIdSpy).toHaveBeenCalledTimes(1);
      expect(personGetAccountSpy).toHaveBeenCalledTimes(1);

      personUpdateSpy.mockReset();
      personExistsByIdSpy.mockReset();
      personGetAccountSpy.mockReset();
    });

    it('should throw an error if person account not verified', async () => {
      expect.assertions(4);

      const person = {
        _id: faker.datatype.uuid(),
        name: faker.name.firstName(),
        birthDate: new Date('2000-01-01'),
      };
      const personUpdateSpy = jest.spyOn(PersonRepository.prototype, 'update');
      const personExistsByIdSpy = jest.spyOn(PersonRepository, 'existsById').mockResolvedValueOnce(true);
      const personGetAccountSpy = jest.spyOn(PersonRepository.prototype, 'getAccount').mockResolvedValueOnce({
        status: StatusEnum.UNVERIFIED,
      } as any);

      const result = service.update(person);

      await expect(result).rejects.toThrow(new ValidationError('ACCOUNT_IS_NOT_VERIFIED'));
      expect(personUpdateSpy).toHaveBeenCalledTimes(0);
      expect(personExistsByIdSpy).toHaveBeenCalledTimes(1);
      expect(personGetAccountSpy).toHaveBeenCalledTimes(1);

      personUpdateSpy.mockReset();
      personExistsByIdSpy.mockReset();
      personGetAccountSpy.mockReset();
    });

    it('should throw an error if person account is disabled', async () => {
      expect.assertions(4);

      const person = {
        _id: faker.datatype.uuid(),
        name: faker.name.firstName(),
        birthDate: new Date('2000-01-01'),
      };
      const personUpdateSpy = jest.spyOn(PersonRepository.prototype, 'update');
      const personExistsByIdSpy = jest.spyOn(PersonRepository, 'existsById').mockResolvedValueOnce(true);
      const personGetAccountSpy = jest.spyOn(PersonRepository.prototype, 'getAccount').mockResolvedValueOnce({
        status: StatusEnum.DISABLED,
      } as any);

      const result = service.update(person);

      await expect(result).rejects.toThrow(new ValidationError('ACCOUNT_IS_NOT_VERIFIED'));
      expect(personUpdateSpy).toHaveBeenCalledTimes(0);
      expect(personExistsByIdSpy).toHaveBeenCalledTimes(1);
      expect(personGetAccountSpy).toHaveBeenCalledTimes(1);

      personUpdateSpy.mockReset();
      personExistsByIdSpy.mockReset();
      personGetAccountSpy.mockReset();
    });
  });
});
