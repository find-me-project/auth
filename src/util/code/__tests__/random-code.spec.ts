import { describe, it, expect } from '@jest/globals';
import randomCode from '../random-code';

describe('random code', () => {
  it('should generate a random code', () => {
    expect.assertions(2);

    const result = randomCode(6);

    expect(result).toBeDefined();
    expect(result).toHaveLength(6);
  });
});
