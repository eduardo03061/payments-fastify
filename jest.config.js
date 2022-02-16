module.exports = {
  collectCoverageFrom: ['<rootDir>/src/***/*.ts'],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
  moduleFileExtensions: [
    "js",
    "ts",
  ],
  moduleNameMapper: {
    '@/(.*)$': ['<rootDir>/src/$1'],
    // https://kulshekhar.github.io/ts-jest/docs/getting-started/paths-mapping
    '^@/models/(.*)$': ['<rootDir>/src/models/$1']
  },
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  }
}
