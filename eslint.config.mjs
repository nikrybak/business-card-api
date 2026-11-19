import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const ACROSS_FOLDERS = { group: ['../*'], message: 'Import across folders through the ~/ alias' };

const layer = (files, banned, ignores = []) => ({
  files,
  ignores,
  rules: { 'no-restricted-imports': ['error', { patterns: [ACROSS_FOLDERS, ...banned] }] },
});

const ban = (group, message) => ({ group, message });

const NO_API = ban(['~/*/api/*'], 'The API layer depends on this layer, never the other way');
const NO_DATA = ban(['~/*/data/*'], 'Reach storage through the domain port, the module binds the adapter');
const NO_PRISMA = ban(['~/prisma', '~/generated/*'], 'Storage types come through the domain port file');
const NO_GRAPHQL = ban(['@nestjs/graphql', 'dataloader'], 'Transport stays in the API layer');

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'src/generated', '.yarn', '.pnp.*'] },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-extraneous-class': 'off',
      // Framework hooks (Apollo plugins, Nest lifecycle) are async by contract even when they do not await
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      'no-restricted-imports': ['error', { patterns: [ACROSS_FOLDERS] }],
    },
  },
  layer(['src/*/domain/**'], [NO_API, NO_DATA, NO_GRAPHQL, NO_PRISMA], ['src/*/domain/*.reader.ts']),
  layer(['src/*/domain/*.reader.ts'], [NO_API, NO_DATA, NO_GRAPHQL]),
  layer(['src/*/api/**'], [NO_DATA, NO_PRISMA]),
  layer(['src/*/data/**'], [NO_API, NO_GRAPHQL]),
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: {
        module: 'writable',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
      },
    },
  },
);
