const http = require('http');
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const projectRoutes = require('./projects/routes.js');
const i18nRoutes = require('./i18n/routes.js');

const server = http.createServer(app);

const PORT = process.env.npm_package_myServerApp_port || 8080;

app.use(cookieSession({
  secret: 'there is no secret at all'
}));

app.use('/data', bodyParser.json());

const dataRouter = express.Router();

app.use('/data/v1', dataRouter);

app.use('/bootstrap', express.static(path.join(__dirname, '../node_modules/bootstrap/dist')));
app.use(express.static(path.join(__dirname, '../public')));
require('./isomorphic')(app);

const webServer = {
  start: done => {
    /* globals db:false */
    global.db = new sqlite3.Database(':memory:', err => {
      if (err) return done(err);
      fs.readFile(path.join(__dirname, 'projects/data.sql'), 'utf8', (err, data) => {
        if (err) return done(err);
        db.exec(data, err => {
          if (err) return done(err);
          Promise.all([
            projectRoutes('/projects', dataRouter),
            i18nRoutes('/i18n', dataRouter)
          ])
            .then(() => server.listen(PORT, () => {
              console.log(`Server running at http://localhost:${PORT}/`);
              done();
            }))
            .catch(done);
        });
      });
    });
  },
  stop: done => {
    server.close(done);
  }
};

module.exports = webServer;
