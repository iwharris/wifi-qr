module.exports = {
    transform: {
        '^.+\\.ts?$': ['ts-jest', { tsconfig: { importHelpers: true } }],
    },
    testEnvironment: 'node',
    testRegex: '/test/.*\\.(test|spec)?\\.(ts)$',
    moduleFileExtensions: ['ts', 'js'],
};
