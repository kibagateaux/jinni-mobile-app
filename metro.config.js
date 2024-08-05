// eslint-disable-next-line
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

// This replaces `const config = getDefaultConfig(__dirname);`
const config = getSentryExpoConfig(__dirname);

module.exports = {
    ...config,
    resolver: {
        ...config.resolver,
        extraNodeModules: {
            stream: require.resolve('react-native-stream'),
            ...config.resolver.extraNodeModules,
        },
    },
};
