import getLocale from '../get-locale';

describe('get locale', () => {
  it('should load the correct locale', () => {
    expect.assertions(1);

    const result = getLocale();
    expect(result).toBeDefined();
  });

  it('should load default locale', () => {
    expect.assertions(1);

    process.env = {};
    const result = getLocale();

    expect(result).toBeDefined();
  });
});
