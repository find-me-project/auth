import { faker } from '@faker-js/faker';
import { describe, it, expect } from '@jest/globals';
import ValidationError from '../../../../util/error/validation-error';
import makeAccountDetails from '..';

describe('make account details', () => {
  it('should make a new account details', () => {
    expect.assertions(12);

    const result = makeAccountDetails({});

    expect(result._id).toBeDefined();
    expect(result.emailUpdatedAt).toBeUndefined();
    expect(result.lastSignIn).toBeUndefined();
    expect(result.recoverCode).toBeUndefined();
    expect(result.recoverCodeDate).toBeUndefined();
    expect(result.activationDate).toBeUndefined();
    expect(result.activationCode).toBeDefined();
    expect(result.activationCodeDate).toBeDefined();
    expect(result.countFailedActivationAttempts).toBeUndefined();
    expect(result.countFailedRecoveryAttempts).toBeUndefined();
    expect(result.countFailedSignInAttempts).toBeUndefined();
    expect(result.lastFailedSignInAttemptDate).toBeUndefined();
  });

  it('should make a new account details with the data provided', () => {
    expect.assertions(12);

    const details = {
      _id: faker.datatype.uuid(),
      activationCode: '01234567',
      activationCodeDate: new Date(),
    };
    const result = makeAccountDetails(details);

    expect(result._id).toBe(details._id);
    expect(result.emailUpdatedAt).toBeUndefined();
    expect(result.lastSignIn).toBeUndefined();
    expect(result.recoverCode).toBeUndefined();
    expect(result.recoverCodeDate).toBeUndefined();
    expect(result.activationDate).toBeUndefined();
    expect(result.activationCode).toBe(details.activationCode);
    expect(result.activationCodeDate).toBe(details.activationCodeDate);
    expect(result.countFailedActivationAttempts).toBeUndefined();
    expect(result.countFailedRecoveryAttempts).toBeUndefined();
    expect(result.countFailedSignInAttempts).toBeUndefined();
    expect(result.lastFailedSignInAttemptDate).toBeUndefined();
  });

  it('should throw an exception if _id is invalid', () => {
    expect.assertions(1);

    const data = {
      _id: 'invalid_id',
    };

    expect(
      () => makeAccountDetails(data),
    )
      .toThrow(new ValidationError('ID_INVALID'));
  });
});
