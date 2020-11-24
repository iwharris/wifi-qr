module.exports = {
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
    testEnvironment: 'node',
    testRegex: '/test/.*\\.(test|spec)?\\.(ts)$',
    moduleFileExtensions: ['ts', 'js'],
    globals: {
        'ts-jest': {
            tsconfig: {
                importHelpers: true,
            },
        },
    },
};
