module.exports = {
	env: {
		browser: false,
		es2021: true,
		mocha: true,
		node: true,
		'jest/globals': true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ['./tsconfig.json'],
		ecmaVersion: 2020,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	plugins: ['@typescript-eslint', 'jsx-a11y', 'react', 'prettier', 'eslint-plugin-import-helpers', 'jest'],
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'plugin:react/recommended',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:import/typescript',
		'plugin:jsx-a11y/recommended',
		'prettier',
		'next/core-web-vitals',
	],
	rules: {
		'react/react-in-jsx-scope': 'off',
		'jsx-a11y/anchor-is-valid': [
			'error',
			{
				components: ['Link'],
				specialLink: ['hrefLeft', 'hrefRight'],
				aspects: ['invalidHref', 'preferButton'],
			},
		],
		'import-helpers/order-imports': [
			'warn',
			{
				newlinesBetween: 'never',
				groups: [
					'module',
					'/^contracts/',
					'/^scripts/',
					'/^artifacts/',
					'/^components/',
					'/^pages/',
					'/^public/',
					'/^styles/',
					'/^lib/',
					'/^util/',
					['parent', 'sibling', 'index'],
				],
				alphabetize: { order: 'asc', ignoreCase: false },
			},
		],
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'react/jsx-filename-extension': [1, { extensions: ['.tsx', 'jsx'] }],
		'react/prop-types': 0,
		'jest/no-disabled-tests': 'warn',
		'jest/no-focused-tests': 'error',
		'jest/no-identical-title': 'error',
		'jest/prefer-to-have-length': 'warn',
		'jest/valid-expect': 'error',
	},
	settings: {
		react: {
			version: 'detect',
		},
		'import/resolver': {
			'babel-module': {
				extensions: ['.ts', '.tsx', '.js', '.jsx'],
			},
		},
	},
};
