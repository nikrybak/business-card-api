/** @type {import('prettier').Config} */
module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 110,
  // Resolved here, so the plugin loads the same way under Yarn PnP and plain node_modules
  plugins: [require.resolve('@ianvs/prettier-plugin-sort-imports')],
  importOrder: ['<BUILTIN_MODULES>', '<THIRD_PARTY_MODULES>', '', '^~/', '', '^[.]'],
  importOrderTypeScriptVersion: '5.9.0',
  importOrderParserPlugins: ['typescript', 'decorators-legacy'],
};
