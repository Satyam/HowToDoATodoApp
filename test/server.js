/*globals describe:false, it:false*/

const supertest = require('supertest');
const chai = require('chai');
const expect = chai.expect;

const PORT = process.env.npm_package_myServerApp_port || 8080;

const webserver = supertest.agent(`http://localhost:${PORT}`);

describe('Static pages test', () => {
  it('Get / should return home page', done => {
    webserver
      .get('/')
      .expect('Content-type', /text\/html/)
      .expect(200)
      .expect(/<title>How to do a Todo App<\/title>/)
      .end(done);
  });
});
