/** @type {import('jest').Config} */
module.exports = {
  ...require('../jest.config.js'),
  rootDir: '..',
  roots: ['<rootDir>/test'],
  testRegex: '\\.e2e-spec\\.ts$',
  testTimeout: 30_000,
};
