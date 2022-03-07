import ValidationError from '../validation-error';

describe('validation error', () => {
  it('should create a validation error', () => {
    expect.assertions(4);

    const error = new ValidationError('ID_INVALID');

    expect(error.getName()).toBe('ValidationError');
    expect(error.getCode()).toBe('ID_INVALID');
    expect(error.getMessage()).toBe('Identifier is not a valid');
    expect(error.getParams()).toBeUndefined();
  });

  it('should create a validation error with params', () => {
    expect.assertions(1);

    const params = { value: 'dummy' };
    const error = new ValidationError('ANY_CODE', params);

    expect(error.getParams()).toStrictEqual(params);
  });
});
