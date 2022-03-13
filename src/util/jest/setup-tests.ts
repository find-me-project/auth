import { jest, beforeEach } from '@jest/globals';
import { config } from 'dotenv';

jest.setTimeout(20 * 1000);

beforeEach(() => {
  config();
});
