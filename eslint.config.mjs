import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', '.sites-runtime/**', '.openai/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  { files: ['**/*.{ts,tsx}'], plugins: { 'react-hooks': reactHooks }, rules: reactHooks.configs.recommended.rules },
  { files: ['components/ui/**/*.{ts,tsx}'], rules: {
    '@typescript-eslint/no-unused-vars': 'off', 'react-hooks/purity': 'off', 'react-hooks/set-state-in-effect': 'off',
  } },
);
