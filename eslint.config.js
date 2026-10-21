import js from '@eslint/js'
import ts from 'typescript-eslint'
import vue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'
import vueParser from 'vue-eslint-parser'

export default ts.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'temp_init/**'],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...vue.configs['flat/recommended'],
  prettier,
  {
    files: ['*.vue', '**/*.vue', '*.ts', '**/*.ts'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: ts.parser,
      },
      globals: {
        ...js.configs.recommended.languageOptions?.globals,
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        MouseEvent: 'readonly',
        HTMLElement: 'readonly',
        Node: 'readonly',
        Event: 'readonly',
        KeyboardEvent: 'readonly',
        EventTarget: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLSelectElement: 'readonly',
        console: 'readonly',
      },
    },
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-console': 'warn',
      'no-debugger': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
)
