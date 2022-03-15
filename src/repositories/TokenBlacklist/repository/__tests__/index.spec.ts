import { describe, it, expect } from '@jest/globals';
import { TokenBlacklistRepository } from '../../..';
import ValidationError from '../../../../util/error/validation-error';

describe('token blacklist repository', () => {
  describe('constructor', () => {
    it('should create a token blacklist repository', () => {
      expect.assertions(1);

      const repository = new TokenBlacklistRepository();

      expect(repository).toBeDefined();
    });

    it('should throw an exception if an invalid environment is provided', () => {
      expect.assertions(1);

      process.env = {};

      expect(
        () => new TokenBlacklistRepository(),
      ).toThrow(new ValidationError('INTERNAL_ERROR_INVALID_ENV'));
    });
  });
});
