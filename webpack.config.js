const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: {
    application: [
      'babel-polyfill',
      './web/static/js/app.jsx',
      './web/static/css/app.scss'
    ]
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['es2015', 'stage-0', 'react']
        }
      }, {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader', options: { sourceMap: true } },
            { loader: 'postcss-loader', options: { sourceMap: true } },
            { loader: 'sass-loader', options: {
              sourceMap: true,
              includePaths: [
                require('bourbon').includePaths,
                require('bourbon-neat').includePaths
              ]
            } },
          ]
        })
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'priv/static'),
    filename: 'js/app.js'
  },
  plugins: [
    new CopyWebpackPlugin([{ from: './web/static/assets' }]),
    new ExtractTextPlugin('css/app.css')
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      'node_modules',
      __dirname + '/web/static/js'
    ]
  }
};
