const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  modulePaths: [
    '<rootDir>',
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/src/util/jest/setup-tests.ts'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  collectCoverageFrom: [
    '**/*.ts',
    '!**/node_modules/**',
    '!**/parameter-validation/**',
    '!src/database/**',
    // '!src/repositories/index.ts',
    '!src/routes/**',
    // '!src/services/index.ts',
    '!src/index.ts',
    '!**/schema/**',
    '!src/util/router/**',
    '!**/*.d.ts',
    '!src/controllers/**',
    '!src/repositories/TokenBlacklist/**',
  ],
};
