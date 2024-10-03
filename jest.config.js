module.exports = {
    projects: [
        {
            displayName: 'web',
            preset: 'jest-expo', // Use jest-expo preset for Expo projects
            // transform: {
            //   '^.+\\.js$': 'babel-jest', // Transpile JS files using babel-jest
            //   '^.+\\.ts$': 'ts-jest', // If you're using TypeScript
            // },
            moduleNameMapper: {
                '^react-native$': 'react-native-web', // Alias react-native to react-native-web
            },
            testEnvironment: 'jsdom', // Set jsdom for web tests
            testMatch: [
                '<rootDir>/src/**/*.test.web.ts', // Match web-specific test files
                // '<rootDir>/src/**/*.test.ts', // Match multi-platform test files
            ],
        },
        {
            displayName: 'native',
            preset: 'jest-expo', // Use the default React Native preset
            testEnvironment: 'node', // Use Node.js for native tests
            testMatch: [
                '<rootDir>/src/**/*.test.ts', // Match multi-platform test files
                // '<rootDir>/src/**/*.test.native.ts', // Match native-specific test files
            ],
        },
    ],
};
