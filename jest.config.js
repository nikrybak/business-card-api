/** @type {import('jest').Config} */
module.exports = {
  rootDir: 'src',
  testRegex: '\\.spec\\.ts$',
  transform: { '^.+\\.ts$': 'ts-jest' },
  moduleNameMapper: { '^~/(.*)$': '<rootDir>/$1' },
  testEnvironment: 'node',
};
