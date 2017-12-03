const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: {
    application: ['babel-polyfill', './js/app.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, '../priv/static'),
    filename: 'js/app.js',
  },
  plugins: [
    new CopyWebpackPlugin([{ from: './static' }]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      API_HOST: JSON.stringify(
        process.env.API_HOST || 'http://localhost:4000/api/'
      ),
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'js'),
    ],
  },
};
