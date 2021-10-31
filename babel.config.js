module.exports = {
  presets: ['next/babel'],
  plugins: [
    ['react-native-web', { commonjs: true }],
    [
      'formatjs',
      {
        idInterpolationPattern: '[sha512:contenthash:base64:6]',
        ast: true,
        // We can use it when we will have en and other lang files.
        // removeDefaultMessage: process.env.NODE_ENV === 'production',
      },
    ],
  ],
};
