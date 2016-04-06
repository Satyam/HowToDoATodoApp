/* globals describe:false, it:false, before:false, after:false, db:false */
'use strict';
require('babel-register')();
require('babel-polyfill');

const chai = require('chai');
const expect = chai.expect;
const axios = require('axios');

const server = require('../..');

const PORT = process.env.npm_package_myServerApp_port || 8080;
const HOST = process.env.npm_package_myServerApp_host || 'http://localhost';

const http = axios.create({
  baseURL: `${HOST}:${PORT}`
});

describe('Server functional test', function () {
  before('Starting server', function (done) {
    server.start(done);
  });

  after('Closing the server', function (done) {
    db.all('PRAGMA integrity_check', (err, list) => {
      if (err) return done(err);
      expect(list).to.be.an.instanceof(Array);
      expect(list).to.have.lengthOf(1);
      expect(list[0]).to.be.an.instanceof(Object);
      expect(list[0].integrity_check).to.equal('ok');
      db.all('PRAGMA foreign_key_check', (err, list) => {
        if (err) return done(err);
        expect(list).to.be.an.instanceof(Array);
        expect(list).to.have.lengthOf(0);
        server.stop(done);
      });
    });
  });

  describe('Static pages test', function () {
    it('Get / should return home page', function () {
      return http.get('/')
        .then(response => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('text/html');
          expect(response.data).to.contain('<title>How to do a Todo App</title>');
        });
    });

    it('Get /xyz should return a "page not found" error', function () {
      return http.get('/xyz')
        .then(
          response => {
            throw new Error('Should not have found it');
          },
          response => {
            expect(response.status).to.equal(404);
          }
        );
    });
  });
});
