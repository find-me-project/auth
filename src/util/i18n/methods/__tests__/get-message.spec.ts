import getMessage from '../get-message';

describe('get message', () => {
  it('should return the message', () => {
    expect.assertions(4);

    const key = 'INTERNAL_ERROR_INVALID_ENV';
    const result = getMessage(key);

    expect(result).toBeDefined();
    expect(result.code).toStrictEqual(key);
    expect(result.message).toBe('Internal error. Invalid environment file');
    expect(result.params).toBeUndefined();
  });

  it('should return default message if message is not found', () => {
    expect.assertions(4);

    const key = 'ANY_I18N_INVALID_KEY';
    const result = getMessage(key);

    expect(result).toBeDefined();
    expect(result.code).toStrictEqual(key);
    expect(result.message).toBeUndefined();
    expect(result.params).toBeUndefined();
  });

  it('should return message with params', () => {
    expect.assertions(4);

    const key = 'NAME_MIN_LENGTH';
    const params = { value: 2 };
    const result = getMessage(key, params);

    expect(result).toBeDefined();
    expect(result.code).toStrictEqual(key);
    expect(result.message).toBe(`Name must be at least ${params.value} characters`);
    expect(result.params).toStrictEqual(params);
  });
});
