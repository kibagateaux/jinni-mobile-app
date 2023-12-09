// eslint-disable-next-line
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = {
    ...config,
    resolver: {
        ...config.resolver,
        extraNodeModules: {
            ...config.resolver.extraNodeModules,
            stream: require.resolve('react-native-stream'),
        },
    },
};
