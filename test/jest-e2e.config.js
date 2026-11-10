/** @type {import('jest').Config} */
module.exports = {
  rootDir: '..',
  testRegex: 'test/.+\\.e2e-spec\\.ts$',
  transform: { '^.+\\.ts$': 'ts-jest' },
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    // The generated Prisma client imports its own TypeScript files with a .js extension
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testEnvironment: 'node',
};
