const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: {
    application: ['babel-polyfill', './js/app.jsx', './css/app.scss'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader', options: { sourceMap: true } },
            { loader: 'postcss-loader', options: { sourceMap: true } },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                includePaths: [
                  require('bourbon').includePaths,
                  require('bourbon-neat').includePaths,
                ],
              },
            },
          ],
        }),
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, '../priv/static'),
    filename: 'js/app.js',
  },
  plugins: [
    new CopyWebpackPlugin([{ from: './static' }]),
    new ExtractTextPlugin('css/app.css'),
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