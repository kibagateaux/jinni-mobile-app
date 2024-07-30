module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            'babel-preset-expo',
            // 'react-native-dotenv',
        ],
        plugins: [
            [
                'module-resolver',
                {
                    extensions: ['.ts', '.tsx', '.json'],
                    root: ['./src/'],
                    alias: {
                        components: './src/components',
                        utils: './src/utils',
                        assets: './src/assets',
                        hooks: './src/hooks',
                        contexts: './src/contexts',
                        types: './src/types',
                    },
                },
            ],
            // overwrite NodeJS dependencies with shims. TODO idk if necessary
            'babel-plugin-rewrite-require',
            '@babel/plugin-proposal-export-namespace-from', // to use RNGH and reanimated on web
            'react-native-reanimated/plugin', // supposed to be last plugin!
        ],
        // aliases: {
        //   stream: 'readable-stream',
        // },
    };
};
