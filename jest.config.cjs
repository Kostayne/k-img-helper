/* eslint-disable no-undef */
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',

  moduleNameMapper: {
    '(.*)\\.js$': '$1',
  },

  transformIgnorePatterns: [
    'node_modules/',
    'node_modules/(?!(file-type)/)',
    'node_modules/(?!(strtok3)/)'
  ]
};
