module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: false,
  bail: 1,
  testMatch: ['<rootDir>/src.tests/**/*.+(ts|tsx)'],
  transform: { '^.+\\.(ts|tsx)$': 'ts-jest' },
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/*.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      babelConfig: true,
    },
  },
};
