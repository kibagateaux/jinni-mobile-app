module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      // 'react-native-dotenv',
    ],
    plugins: [
      // overwrite NodeJS dependencies with shims. TODO idk if necessary
      'babel-plugin-rewrite-require',
      '@babel/plugin-proposal-export-namespace-from', // to use RNGH and reanimated on web
      'expo-router/babel', // Also supposed to be last plugin!
      'react-native-reanimated/plugin', // supposed to be last plugin!
    ],
    // aliases: {
    //   stream: 'readable-stream', 
    // },
  };
};
