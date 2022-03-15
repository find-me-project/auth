import { faker } from '@faker-js/faker';
import {
  describe, it, expect, jest,
} from '@jest/globals';
import { TokenBlacklistService } from '../..';
import { TokenBlacklistRepository } from '../../../repositories';

describe('token blacklist service', () => {
  const service = new TokenBlacklistService();

  describe('create', () => {
    it('should create a new token', async () => {
      expect.assertions(2);

      const token = {
        _id: faker.datatype.uuid(),
        revocationDate: new Date(),
      };
      const tokenBlacklistCreateSpy = jest.spyOn(TokenBlacklistRepository.prototype, 'create').mockResolvedValueOnce(token);

      const result = await service.create(token);

      expect(result).toStrictEqual(token);
      expect(tokenBlacklistCreateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('exists by id', () => {
    it('should return true if the token exists', async () => {
      expect.assertions(2);

      const tokenBlacklistExistsByIdSpy = jest.spyOn(TokenBlacklistRepository.prototype, 'existsById').mockResolvedValueOnce(true);

      const result = await service.existsById(faker.datatype.uuid());

      expect(result).toBeTruthy();
      expect(tokenBlacklistExistsByIdSpy).toHaveBeenCalledTimes(1);

      tokenBlacklistExistsByIdSpy.mockReset();
    });

    it('should return false if the token not exists', async () => {
      expect.assertions(2);

      const tokenBlacklistExistsByIdSpy = jest.spyOn(TokenBlacklistRepository.prototype, 'existsById').mockResolvedValueOnce(false);

      const result = await service.existsById(faker.datatype.uuid());

      expect(result).toBeFalsy();
      expect(tokenBlacklistExistsByIdSpy).toHaveBeenCalledTimes(1);

      tokenBlacklistExistsByIdSpy.mockReset();
    });
  });
});
