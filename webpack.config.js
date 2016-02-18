module.exports = {
  entry: './client/main.js',
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
