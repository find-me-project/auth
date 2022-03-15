import { faker } from '@faker-js/faker';
import { describe, it, expect } from '@jest/globals';
import makeTokenBlacklist from '..';
import ValidationError from '../../../../util/error/validation-error';

describe('make token blacklist', () => {
  it('should create a new token blacklist', () => {
    expect.assertions(2);

    const token = {
      _id: faker.datatype.uuid(),
      revocationDate: new Date(),
    };
    const result = makeTokenBlacklist(token);

    expect(result._id).toBe(token._id);
    expect(result.revocationDate).toBe(token.revocationDate);
  });

  it('should throw an exception if _id is not provided', () => {
    expect.assertions(1);

    const token = {
      _id: undefined,
    };

    expect(
      () => makeTokenBlacklist(token as any),
    )
      .toThrow(new ValidationError('TOKEN_ID_REQUIRED'));
  });

  it('should throw an exception if revocationDate is not provided', () => {
    expect.assertions(1);

    const token = {
      _id: faker.datatype.uuid(),
      revocationDate: undefined,
    };

    expect(
      () => makeTokenBlacklist(token as any),
    )
      .toThrow(new ValidationError('TOKEN_REVOCATION_DATE_REQUIRED'));
  });

  it('should throw an exception if revocationDate is invalid', () => {
    expect.assertions(1);

    const token = {
      _id: faker.datatype.uuid(),
      revocationDate: new Date('invalid date'),
    };

    expect(
      () => makeTokenBlacklist(token as any),
    )
      .toThrow(new ValidationError('TOKEN_REVOCATION_DATE_INVALID'));
  });
});
