const http = require('http');
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const routes = require('./routes.js');

const server = http.createServer(app);

const PORT = process.env.npm_package_myServerApp_port || 8080;

app.use(cookieSession({
  secret: 'there is no secret at all'
}));

app.get('/i18n/locale/:locale', function (req, res) {
  const locale = req.params.locale;
  req.session.locale = locale;
  res.json({locale});
});

app.use('/data', bodyParser.json());

const dataRouter = express.Router();

app.use('/data/v1', dataRouter);

app.use(express.static(path.join(__dirname, '../public')));

require('./isom.js')(app);

const webServer = {
  start: done => {
    /* globals db:false */
    global.db = new sqlite3.Database(':memory:', err => {
      if (err) return done(err);
      fs.readFile(path.join(__dirname, 'data.sql'), 'utf8', (err, data) => {
        if (err) return done(err);
        db.exec(data, err => {
          if (err) return done(err);
          routes(dataRouter, err => {
            if (err) return done(err);
            server.listen(PORT, () => {
              console.log(`Server running at http://localhost:${PORT}/`);
              done();
            });
          });
        });
      });
    });
  },
  stop: done => {
    server.close(done);
  }
};

module.exports = webServer;
