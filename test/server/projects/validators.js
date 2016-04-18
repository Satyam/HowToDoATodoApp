const chai = require('chai');
const expect = chai.expect;
const path = require('path');

const validators = require(path.join(process.cwd(), 'server/projects/validators.js'));

const res = callback => ({
  status: code => ({
    send: msg => callback(code, msg)
  })
});

const resExpectNoFail = done => res((status, msg) => done(new Error(`${status}: ${msg}`)));

const resExpectBadRequest = done => res((status, msg) => {
  expect(status).to.be.equal(400);
  expect(msg).to.be.equal('Bad request');
  done();
});

describe('Route params validators unit test', function () {
  it('add$valid should add $valid object', function (done) {
    const req = {};
    validators.add$valid(req, {}, () => {
      expect(req.$valid).to.be.object;
      expect(req.$valid).to.be.empty;
      done();
    });
  });
  describe('validators', function () {
    let req;
    beforeEach('set req and res', function (done) {
      req = {
        params: {},
        query: {},
        body: {}
      };
      validators.add$valid(req, {}, done);
    });
    describe('validatePid', function () {
      it('should accept pid as numeric string', function (done) {
        req.params.pid = '123';
        validators.validatePid(
          req,
          resExpectNoFail(done),
          function () {
            expect(req.$valid.keys).to.be.object;
            expect(req.$valid.keys.pid).to.be.equal(123);
            done();
          }
        );
      });
      it('should fail on pid as non-numeric string', function (done) {
        req.params.pid = 'abc';
        validators.validatePid(
          req,
          resExpectBadRequest(done),
          function () {
            done('should have failed');
          }
        );
      });
      it('should fail on mising pid', function (done) {
        validators.validatePid(
          req,
          resExpectBadRequest(done),
          function () {
            done('should have failed');
          }
        );
      });
    });
    describe('validateTid', function () {
      it('should accept pid & tid as numeric strings', function (done) {
        req.params.pid = '123';
        req.params.tid = '456';
        validators.validateTid(
          req,
          resExpectNoFail(done),
          function () {
            expect(req.$valid.keys).to.be.object;
            expect(req.$valid.keys.pid).to.be.equal(123);
            expect(req.$valid.keys.tid).to.be.equal(456);
            done();
          }
        );
      });
      [
        {pid: 'a', tid: '456'},
        {pid: '123', tid: 'b'},
        {pid: 'a', tid: 'b'},
        {pid: '123'},
        {tid: '456'}
      ].forEach(params => {
        it(`should fail on pid: ${params.pid}, tid: ${params.tid}`, function (done) {
          req.params = params;
          validators.validateTid(
            req,
            resExpectBadRequest(done),
            function () {
              done('should have failed');
            }
          );
        });
      });
    });
    describe('validatePrjData', function () {
      [
        {name: 'new name', descr: 'new descr'},
        {name: 'new name', descr: null},
        {name: null, descr: 'new descr'},
        {name: 'new name'},
        {descr: 'new descr'}
      ].forEach(body => {
        it(`Should work with name: ${body.name}, descr: ${body.descr}`, function (done) {
          req.body = body;
          validators.validatePrjData(
            req,
            resExpectNoFail,
            function () {
              const v = req.$valid;
              expect(v.data).to.be.object;
              expect(v.data).to.be.eql(body);
              done();
            }
          );
        });
      });
      it('Should fail on no data', function (done) {
        validators.validatePrjData(
          req,
          resExpectBadRequest(done),
          function () {
            done('should have failed');
          }
        );
      });
    });
    describe('validateTaskData', function () {
      [
        {descr: 'new descr', complete: true},
        {descr: 'new descr', complete: 0},
        {descr: null, complete: false},
        {descr: 'new descr'},
        {complete: 123}
      ].forEach(body => {
        it(`Should work with descr: ${body.descr}, complete: ${body.complete}`, function (done) {
          req.body = body;
          validators.validateTaskData(
            req,
            resExpectNoFail,
            function () {
              const v = req.$valid;
              expect(v.data).to.be.object;
              expect(v.data.descr).to.be.eql(body.descr);
              expect(v.data.complete).to.be.eql(body.complete === undefined ? body.complete : !!body.complete);
              done();
            }
          );
        });
      });
      it('Should fail on no data', function (done) {
        validators.validateTaskData(
          req,
          resExpectBadRequest(done),
          function () {
            done('should have failed');
          }
        );
      });
    });
  });
});
