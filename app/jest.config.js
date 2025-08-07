module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/__tests__/**/*.tsx',
    '**/?(*.)+(spec|test).ts',
    '**/?(*.)+(spec|test).tsx'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.tsx$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/clean-architecture/**/*.ts',
    'src/clean-architecture/**/*.tsx',
    '!src/clean-architecture/**/*.d.ts',
    '!src/clean-architecture/**/index.ts',
    '!src/clean-architecture/**/*.test.ts',
    '!src/clean-architecture/**/*.test.tsx',
    '!src/clean-architecture/**/*.spec.ts',
    '!src/clean-architecture/**/*.spec.tsx'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/clean-architecture/(.*)$': '<rootDir>/src/clean-architecture/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/database/(.*)$': '<rootDir>/src/database/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
    // Mock React Native modules
    '^react-native$': '<rootDir>/src/__mocks__/react-native.ts',
    '^@react-native/(.*)$': '<rootDir>/src/__mocks__/@react-native/$1',
    '^@react-navigation/(.*)$': '<rootDir>/src/__mocks__/@react-navigation/$1',
    // Mock Expo modules
    '^expo-sqlite$': '<rootDir>/src/__mocks__/expo-sqlite.ts',
    '^expo/(.*)$': '<rootDir>/src/__mocks__/expo/$1',
    // Mock other problematic modules
    '^react-native-gesture-handler$': '<rootDir>/src/__mocks__/react-native-gesture-handler.ts',
    '^@react-native-async-storage/async-storage$': '<rootDir>/src/__mocks__/@react-native-async-storage/async-storage.ts',
  },
  setupFilesAfterEnv: [],
  testTimeout: 10000,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-.*|expo-.*)/)'
  ],
  // Reduzir verbosidade dos logs
  verbose: false,
  silent: false,
  // Mostrar apenas erros e warnings
  errorOnDeprecated: false,
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
        baseUrl: '.',
        paths: {
          '@/*': ['src/*'],
          '@/clean-architecture/*': ['src/clean-architecture/*'],
          '@/components/*': ['src/components/*'],
          '@/screens/*': ['src/screens/*'],
          '@/services/*': ['src/services/*'],
          '@/database/*': ['src/database/*'],
          '@/utils/*': ['src/utils/*'],
          '@/styles/*': ['src/styles/*']
        }
      }
    }
  }
}; 