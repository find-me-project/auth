import { v4, v5 } from 'uuid';
import { describe, it, expect } from '@jest/globals';
import { uuidValidateV4 } from '..';

describe('uuid - uuidValidateV4', () => {
  it('should validate uuid v4', () => {
    expect.assertions(1);

    const uuid = v4();

    const result = uuidValidateV4(uuid);
    expect(result).toBeTruthy();
  });

  it('should validate uuid invalid', () => {
    expect.assertions(1);
    const uuid = 'invalid_uuid';

    const result = uuidValidateV4(uuid);
    expect(result).toBeFalsy();
  });

  it('should validate uuid version (v4)', () => {
    expect.assertions(1);
    const uuid = v5('uuid', '1b671a64-40d5-491e-99b0-da01ff1f3341');

    const result = uuidValidateV4(uuid);
    expect(result).toBeFalsy();
  });
});
