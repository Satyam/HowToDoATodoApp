const chai = require('chai');
const expect = chai.expect;
const path = require('path');

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureMockStore([thunk]);

import nock from 'nock';

const PORT = process.env.npm_package_myServerApp_port || 8080;
const HOST = process.env.npm_package_myServerApp_host || 'http://localhost';
const SERVER = `${HOST}:${PORT}`;
const API = '/data/v1/projects';

const projects = require(path.join(process.cwd(), 'client/actions/projects.js'));

describe('projects', function () {
  it('constants', function () {
    const stages = ['REQUEST', 'SUCCESS', 'FAILURE'];
    const types = [
      'ALL_PROJECTS',
      'PROJECT_BY_ID',
      'ADD_PROJECT',
      'UPDATE_PROJECT',
      'DELETE_PROJECT',
      'ADD_TASK',
      'UPDATE_TASK',
      'DELETE_TASK'
    ];
    const contentMatch = /^\[([^\]]+)\]\s(.+)$/;
    types.forEach(type => stages.forEach(stage => {
      const name = `${type}_${stage}`;
      expect(projects[name]).to.be.a('string');
      const matches = contentMatch.exec(projects[name]);
      // console.log(name, matches);
      expect(matches[1]).to.equal(stage);
      expect(matches[2].length).to.be.above(1);
    }));
  });
  describe('action creators', function () {
    let store;
    beforeEach(function () {
      store = mockStore({ projects: {} });
    });
    afterEach(function () {
      nock.cleanAll();
    });
    describe('getAllProjects', function () {
      it('standard reply', function (done) {
        const body = [
          {pid: 25, name: 'Writing a Book on Web Dev Tools'},
          {pid: 34, name: 'Cook a Spanish omelette'}
        ];
        nock(SERVER)
          .get(API)
          .query({fields: 'pid,name'})
          .reply(200, { body });

        store.dispatch(projects.getAllProjects())
          .then(() => {
            const actions = store.getActions();
            expect(actions).to.eql(
              [
                {type: projects.ALL_PROJECTS_REQUEST},
                {
                  type: projects.ALL_PROJECTS_SUCCESS,
                  data: { body }
                }
              ]);
          })
          .then(done)
          .catch(done);
      });
      it('error reply', function (done) {
        nock(SERVER)
          .get(API)
          .query({fields: 'pid,name'})
          .reply(404, 'Not found');

        store.dispatch(projects.getAllProjects())
          .then(() => {
            const actions = store.getActions();
            expect(actions[0].type).to.equal(projects.ALL_PROJECTS_REQUEST);
            expect(actions[1].type).to.equal(projects.ALL_PROJECTS_FAILURE);
            expect(actions[1].status).to.equal(404);
            expect(actions[1]).to.have.all.keys('type', 'status', 'msg', 'url');
            // url: contents might change in future releases
            // msg: nock will always return null, see: https://github.com/node-nock/nock/issues/469
          })
          .then(done)
          .catch(done);
      });
    });

    describe('addProject', function () {
      it('standard request', function (done) {
        nock(SERVER)
          .post(API)
          .reply(200, { pid: '45' });

        store.dispatch(projects.addProject('name', 'descr'))
          .then(() => {
            const actions = store.getActions();
            expect(actions).to.eql(
              [
                {
                  type: projects.ADD_PROJECT_REQUEST,
                  name: 'name',
                  descr: 'descr'
                },
                {
                  type: projects.ADD_PROJECT_SUCCESS,
                  data: { pid: '45', name: 'name', descr: 'descr' }
                }
              ]);
          })
          .then(done)
          .catch(done);
      });
      it('error reply', function (done) {
        nock(SERVER)
          .post(API)
          .reply(404, 'Not found');

        store.dispatch(projects.addProject('name', 'descr'))
          .then(() => {
            const actions = store.getActions();
            expect(actions[0].type).to.equal(projects.ADD_PROJECT_REQUEST);
            expect(actions[1].type).to.equal(projects.ADD_PROJECT_FAILURE);
            expect(actions[1].status).to.equal(404);
            expect(actions[1]).to.have.all.keys('type', 'status', 'msg', 'url');
            // url: contents might change in future releases
            // msg: nock will always return null, see: https://github.com/node-nock/nock/issues/469
          })
          .then(done)
          .catch(done);
      });
    });
    //
    // All other tests are very much alike
    //
  });
});
