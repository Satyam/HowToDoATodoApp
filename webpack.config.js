var path = require('path');

module.exports = {
  entry: './client',
  output: {
    path: path.join(__dirname, '/public/lib'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        loader: 'babel-loader'
      }
    ]
  }
};
