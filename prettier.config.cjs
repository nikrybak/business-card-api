/** @type {import('prettier').Config} */
module.exports = {
  singleQuote: true,
  printWidth: 110,
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: ['<BUILTIN_MODULES>', '<THIRD_PARTY_MODULES>', '', '^~/', '', '^[.]'],
  importOrderTypeScriptVersion: '5.9.0',
  importOrderParserPlugins: ['typescript', 'decorators-legacy'],
};
