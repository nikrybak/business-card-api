/** @type {import('jest').Config} */
module.exports = {
  roots: ['<rootDir>/src'],
  testRegex: '\\.spec\\.ts$',
  transform: { '^.+\\.ts$': 'ts-jest' },
  moduleNameMapper: { '^~/(.*)$': '<rootDir>/src/$1' },
  restoreMocks: true,
};
