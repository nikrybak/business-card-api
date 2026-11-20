import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
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
const NO_PRISMA = ban(
  ['~/database', '~/database/*', '~/generated/*'],
  'Storage types come through the domain port file',
);
const NO_GRAPHQL = ban(['@nestjs/graphql', 'dataloader'], 'Transport stays in the API layer');
const NO_APP = ban(['~/app/*'], 'The app root wires everything, nothing below it reaches back');
const NO_SLICES = ban(['~/card', '~/card/*'], 'Slices are wired only by the app root');
const NO_DATABASE = ban(['~/database', '~/database/*'], 'Shared code knows no storage');

export default defineConfig(
  { ignores: ['dist', 'coverage', 'src/generated'] },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      'no-restricted-imports': ['error', { patterns: [ACROSS_FOLDERS] }],
    },
  },
  layer(['src/shared/**'], [NO_APP, NO_SLICES, NO_DATABASE]),
  layer(['src/database/**'], [NO_APP, NO_SLICES]),
  layer(['src/*/*.ts'], [NO_APP], ['src/app/**', 'src/shared/**', 'src/database/**']),
  layer(['src/*/domain/**'], [NO_APP, NO_API, NO_DATA, NO_GRAPHQL, NO_PRISMA], ['src/*/domain/*.reader.ts']),
  layer(['src/*/domain/*.reader.ts'], [NO_APP, NO_API, NO_DATA, NO_GRAPHQL]),
  layer(['src/*/api/**'], [NO_APP, NO_DATA, NO_PRISMA]),
  layer(['src/*/data/**'], [NO_APP, NO_API, NO_GRAPHQL]),
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
    languageOptions: { globals: { process: 'readonly', console: 'readonly', fetch: 'readonly' } },
  },
  { files: ['**/*.js', '**/*.cjs'], languageOptions: { sourceType: 'commonjs' } },
);
