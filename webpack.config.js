const webpack = require('webpack');

var path = require('path');

module.exports = {
  entry: {
    'es-ES': './client/es-ES-loader',
    'en-US': './client/en-US-loader',
    'en-GB': './client/en-GB-loader'
  },
  output: {
    path: path.join(__dirname, '/public/lib'),
    filename: '[name].js',
    publicPath: '/lib/'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('index.js')
  ],
  module: {
    loaders: [
      {
        loader: 'babel-loader'
      },
      {
        test: './client/actions/i18n.js',
        loader: 'if-loader'
      }
    ]
  },
  'if-loader': 'client-side'
};
