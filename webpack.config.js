module.exports = {
  entry: './client',
  output: {
    path: __dirname + '/public/lib',
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
