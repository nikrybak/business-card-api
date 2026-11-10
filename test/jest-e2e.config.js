/** @type {import('jest').Config} */
module.exports = {
  rootDir: '..',
  testRegex: 'test/.+\\.e2e-spec\\.ts$',
  transform: { '^.+\\.ts$': 'ts-jest' },
  moduleNameMapper: { '^~/(.*)$': '<rootDir>/src/$1' },
  testEnvironment: 'node',
};
