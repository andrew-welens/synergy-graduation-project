module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|e2e-spec).ts'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts', '!src/**/*.module.ts'],
  setupFiles: ['reflect-metadata']
}
