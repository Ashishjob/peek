const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development', // Use 'development' during development
  entry: {
    popup: './src/popup.js',
    background: './src/background.js',
    content: './src/content.js'
  },
  output: {
    filename: '[name].js', // Generates popup.js, background.js, etc.
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Clean dist/ before build
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Optional: only if using modern JS features
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: '.' } // Copy everything in public/ to dist/
      ]
    })
  ],
  devtool: 'source-map'
};
