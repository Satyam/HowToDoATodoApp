/*globals describe:false, it:false, before:false, after:false*/
const chai = require('chai');
const expect = chai.expect;
const axios = require('axios');

const server = require('..');

const PORT = process.env.npm_package_myServerApp_port || 8080;

const http = axios.create({
  baseURL: `http://localhost:${PORT}`,
  responseType: 'json'
});

describe('Static pages test', function () {
  before('Starting server', function (done) {
    server.listen(PORT, done);
  });
  after('Closing the server', function (done) {
    server.close(done);
  });
  it('Get / should return home page', function () {
    return http.get('/')
      .then(response => {
        expect(response.status).to.equal(200);
        expect(response.headers['content-type']).to.contain('text/html');
        expect(response.data).to.contain('<title>How to do a Todo App</title>');
      });
  });
  it('Get /index.html should return the same home page', function () {
    return http.get('/index.html')
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
