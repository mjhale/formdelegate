const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

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
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['es2015', 'stage-0', 'react']
      }
    }, {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract(
        'style',
        'css?sourceMap' +
        '!sass?sourceMap' +
          '&includePaths[]=' + require('bourbon').includePaths +
          '&includePaths[]=' + require('bourbon-neat').includePaths
      )
    }]
  },
  output: {
    path: './priv/static',
    filename: 'js/app.js'
  },
  plugins: [
    new CopyWebpackPlugin([{ from: './web/static/assets' }]),
    new ExtractTextPlugin('css/app.css')
  ],
  resolve: {
    extensions: ['', '.js', '.jsx'],
    modulesDirectories: ['node_modules', __dirname + '/web/static/js']
  }
};
