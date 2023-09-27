module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      // 'react-native-dotenv',
    ],
    plugins: [
      // overwrite NodeJS dependencies with shims
      'babel-plugin-rewrite-require',
      'expo-router/babel', // must be last plugin
    ],
    // aliases: {
    //   stream: 'readable-stream', 
    // },
  };
};
