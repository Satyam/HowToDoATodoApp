require('babel-register')();
require('babel-polyfill');
var webServer = require('./server/index.js');

webServer.start(err => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
