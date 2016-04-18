const chai = require('chai');
const expect = chai.expect;
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const root = process.cwd();

const projects = require(path.join(root, 'server/projects/transactions.js'));

describe('Projects server unit test', function () {
  before('Starting db server', function (done) {
    global.db = new sqlite3.Database(':memory:', done);
  });
  describe('Projects Initialization', function () {
    before('Should load data', function (done) {
      fs.readFile(path.join(root, 'server/projects/data.sql'), 'utf8', (err, data) => {
        if (err) return done(err);
        db.exec(data, done);
      });
    });
    describe('initialization', function () {
      before('Should initialize', function (done) {
        projects.init(done);
      });
      describe('getAllProjects', function () {
        it('with no options', function (done) {
          projects.getAllProjects({}, {}, {}, (err, list) => {
            if (err) return done(err);
            expect(list).to.be.an.instanceof(Array);
            expect(list).to.have.lengthOf(2);
            list.forEach(prj => {
              switch (prj.pid) {
                case 25:
                  expect(prj.name).to.contain('Web Dev Tools');
                  expect(prj.descr).to.contain('write a book');
                  break;
                case 34:
                  expect(prj.name).to.contain('Spanish omelette');
                  expect(prj.descr).to.contain('Spanish omelette');
                  break;
                default:
                  expect().to.not.be.ok;
                  break;
              }
            });
            done();
          });
        });
        it('with search term', function (done) {
          projects.getAllProjects({}, {}, { search: 'name=omelette' }, (err, list) => {
            if (err) return done(err);
            expect(list).to.be.an.instanceof(Array);
            expect(list).to.have.lengthOf(1);
            let prj = list[0];
            expect(prj.pid).to.equal(34);
            expect(prj.name).to.contain('Spanish omelette');
            expect(prj.descr).to.contain('Spanish omelette');
            done();
          });
        });
        it('with certain fields only', function (done) {
          projects.getAllProjects({}, {}, { fields: 'name,pid' }, (err, list) => {
            if (err) return done(err);
            expect(list).to.be.an.instanceof(Array);
            expect(list).to.have.lengthOf(2);
            list.forEach(prj => {
              switch (prj.pid) {
                case 25:
                  expect(prj.name).to.contain('Web Dev Tools');
                  expect(prj.descr).to.be.undefined;
                  break;
                case 34:
                  expect(prj.name).to.contain('Spanish omelette');
                  expect(prj.descr).to.be.undefined;
                  break;
                default:
                  expect().to.not.be.ok;
                  break;
              }
            });
            done();
          });
        });

        it('with search and fields', function (done) {
          projects.getAllProjects({}, {}, {
            fields: 'pid',
            search: 'name=omelette'
          }, (err, list) => {
            if (err) return done(err);
            expect(list).to.be.an.instanceof(Array);
            expect(list).to.have.lengthOf(1);
            let prj = list[0];
            expect(prj.pid).to.equal(34);
            expect(prj.name).to.be.undefined;
            expect(prj.descr).to.be.undefined;
            done();
          });
        });
      });
      describe('getProjectById', function () {
        it('25', function (done) {
          projects.getProjectById({ pid: 25 }, {}, {}, (err, data) => {
            if (err) return done(err);
            expect(data.name).to.equal('Writing a Book on Web Dev Tools');
            expect(data.descr).to.equal('Tasks required to write a book on the tools required to develop a web application');
            expect(data.tasks).to.be.an.instanceof(Object);
            let tasks = data.tasks;
            expect(tasks).to.have.all.keys('1', '2', '3');
            expect(tasks[1]).to.be.an.instanceof(Object);
            expect(tasks[1].descr).to.equal('Figure out what kind of application to develop');
            expect(tasks[1].complete).to.be.true;
            done();
          });
        });
        it('pid 9999 should not return any data', function (done) {
          projects.getProjectById({ pid: 9999 }, {}, {}, (err, data) => {
            if (err) return done(err);
            expect(data).to.be.null;
            done();
          });
        });
      });
      describe('getTaskByTid', function () {
        it('pid: 34, tid: 5', function (done) {
          projects.getTaskByTid({ pid: 34, tid: 5 }, {}, {}, (err, data) => {
            if (err) return done(err);
            expect(data.descr).to.equal('Fry the potatoes');
            expect(data.complete).to.be.true;
            done();
          });
        });
        it('task 9999 should not return any data', function (done) {
          projects.getTaskByTid({ pid: 34, tid: 9999 }, {}, {}, (err, data) => {
            if (err) return done(err);
            expect(data).to.be.null;
            done();
          });
        });
        it('task 5 on project 9999 should not return any data', function (done) {
          projects.getTaskByTid({ pid: 9999, tid: 5 }, {}, {}, (err, data) => {
            if (err) return done(err);
            expect(data).to.be.null;
            done();
          });
        });
      });
      describe('addProject', function () {
        it('should return the pid of the added project', function (done) {
          projects.addProject({}, {
            name: 'new project',
            descr: 'new project for testing'
          }, {}, (err, data) => {
            if (err) return done(err);
            expect(data).to.be.an.instanceof(Object);
            expect(data.pid).to.exist;
            expect(data.pid).to.equal(35); // one larger than the last pid in data.sql
            done();
          });
        });
        it('added project should exist', function (done) {
          projects.addProject({}, {
            name: 'new project',
            descr: 'new project for testing'
          }, {}, (err, data) => {
            if (err) return done(err);
            expect(data).to.be.an.instanceof(Object);
            expect(data.pid).to.exist;
            projects.getProjectById({ pid: data.pid }, {}, {}, (err, data) => {
              if (err) return done(err);
              expect(data.name).to.equal('new project');
              expect(data.descr).to.equal('new project for testing');
              expect(data.tasks).to.be.an.instanceof(Object);
              expect(data.tasks).to.be.empty;
              done();
            });
          });
        });
        it('should provide defaults', function (done) {
          projects.addProject({}, {}, {}, (err, data) => {
            if (err) return done(err);
            expect(data).to.be.an.instanceof(Object);
            expect(data.pid).to.exist;
            projects.getProjectById({ pid: data.pid }, {}, {}, (err, data) => {
              if (err) return done(err);
              expect(data.name).to.equal('New Project');
              expect(data.descr).to.equal('No description');
              expect(data.tasks).to.be.an.instanceof(Object);
              expect(data.tasks).to.be.empty;
              done();
            });
          });
        });
      });
      describe('addTaskToProject', function () {
        it('should return the tid', function (done) {
          projects.addTaskToProject(
            { pid: 35 },
            { descr: 'new task' },
            {},
            (err, data) => {
              if (err) return done(err);
              expect(data).to.be.an.instanceof(Object);
              expect(data.tid).to.exist;
              expect(data.tid).to.equal(10); // One larger that the last tid in data.sql
              done();
            }
          );
        });
        it('added task should exist', function (done) {
          projects.addTaskToProject(
            { pid: 35 },
            {
              descr: 'new task',
              complete: true
            },
            {},
            (err, data) => {
              if (err) return done(err);
              expect(data).to.be.an.instanceof(Object);
              expect(data.tid).to.exist;
              projects.getTaskByTid({ pid: 35, tid: data.tid }, {}, {}, (err, data) => {
                if (err) return done(err);
                expect(data.descr).to.equal('new task');
                expect(data.complete).to.be.true;
                done();
              });
            }
          );
        });
        it('should provide defaults', function (done) {
          projects.addTaskToProject(
            { pid: 35 },
            {},
            {},
            (err, data) => {
              if (err) return done(err);
              expect(data).to.be.an.instanceof(Object);
              expect(data.tid).to.exist;
              projects.getTaskByTid({ pid: 35, tid: data.tid }, {}, {}, (err, data) => {
                if (err) return done(err);
                expect(data.descr).to.equal('No description');
                expect(data.complete).to.be.false;
                done();
              });
            }
          );
        });
        it('should fail on unkown project', function (done) {
          projects.addTaskToProject(
            { pid: 9999 },
            {},
            {},
            (err, data) => {
              if (err) return done(err);
              expect(data).to.be.null;
              done();
            }
          );
        });
      });
      describe('updateProject', function () {
        it('should update the name field', function (done) {
          projects.updateProject(
            {pid: 35},
            {name: 'new updated project name'},
            {},
            (err, data) => {
              if (err) return done(err);
              expect(data).to.be.an.instanceof(Object);
              expect(data.pid).to.exist;
              projects.getProjectById({ pid: data.pid }, {}, {}, (err, data) => {
                if (err) return done(err);
                expect(data.name).to.equal('new updated project name');
                expect(data.descr).to.equal('new project for testing');
                done();
              });
            }
          );
        });
        it('should update the description field', function (done) {
          projects.updateProject(
            {pid: 35},
            {descr: 'new updated project description'},
            {},
            (err, data) => {
              if (err) return done(err);
              expect(data).to.be.an.instanceof(Object);
              expect(data.pid).to.exist;
              projects.getProjectById({ pid: data.pid }, {}, {}, (err, data) => {
                if (err) return done(err);
                expect(data.name).to.equal('new updated project name');
                expect(data.descr).to.equal('new updated project description');
                done();
              });
            }
          );
        });
        it('should update both fields', function (done) {
          projects.updateProject(
            {pid: 35},
            {
              name: 'new-new name',
              descr: 'new-new description'
            },
            {},
            (err, data) => {
              if (err) return done(err);
              expect(data).to.be.an.instanceof(Object);
              expect(data.pid).to.exist;
              projects.getProjectById({ pid: data.pid }, {}, {}, (err, data) => {
                if (err) return done(err);
                expect(data.name).to.equal('new-new name');
                expect(data.descr).to.equal('new-new description');
                done();
              });
            }
          );
        });
        it('should fatally fail on no data', function (done) {
          projects.updateProject(
            {pid: 9999},
            {},
            {},
            (err, data) => {
              expect(err).to.be.object;
              expect(err.errno).to.be.equal(1);
              expect(err.code).to.be.equal('SQLITE_ERROR');
              done();
            }
          );
        });
        it('should fail on no-existent pid', function (done) {
          projects.updateProject(
            {pid: 9999},
            {
              name: 'new-new name',
              descr: 'new-new description'
            },
            {},
            (err, data) => {
              expect(data).to.be.null;
              done(err);
            }
          );
        });
      });
      describe('updateTask', function () {
        let tid = null;
        const pid = 35;
        beforeEach('add the task to update', function (done) {
          projects.addTaskToProject(
            { pid },
            {
              descr: 'new task',
              complete: false
            },
            {},
            (err, data) => {
              if (err) return done(err);
              tid = data.tid;
              done();
            }
          );
        });
        it('should update the descr field', function (done) {
          projects.updateTask(
            { pid, tid },
            { descr: 'new updated task name' },
            {},
            (err, data) => {
              if (err) return done(err);
              expect(data).to.be.an.instanceof(Object);
              expect(data.pid).to.equal(pid);
              expect(data.tid).to.equal(tid);
              projects.getTaskByTid({ pid, tid }, {}, {}, (err, data) => {
                if (err) return done(err);
                expect(data.descr).to.equal('new updated task name');
                expect(data.complete).to.be.false;
                done();
              });
            }
          );
        });
        it('should update the complete field', function (done) {
          projects.updateTask(
            { pid, tid },
            { complete: true },
            {},
            (err, data) => {
              if (err) return done(err);
              expect(data).to.be.an.instanceof(Object);
              expect(data.pid).to.equal(pid);
              expect(data.tid).to.equal(tid);
              projects.getTaskByTid({ pid, tid }, {}, {}, (err, data) => {
                if (err) return done(err);
                expect(data.descr).to.equal('new task');
                expect(data.complete).to.be.true;
                done();
              });
            }
          );
        });
        it('should update both fields', function (done) {
          projects.updateTask(
            { pid, tid },
            {
              complete: true,
              descr: 'new updated task name'
            },
            {},
            (err, data) => {
              if (err) return done(err);
              expect(data).to.be.an.instanceof(Object);
              expect(data.pid).to.equal(pid);
              expect(data.tid).to.equal(tid);
              projects.getTaskByTid({ pid, tid }, {}, {}, (err, data) => {
                if (err) return done(err);
                expect(data.descr).to.equal('new updated task name');
                expect(data.complete).to.be.true;
                done();
              });
            }
          );
        });
        it('should fail on wrong tid', function (done) {
          projects.updateTask(
            { pid, tid: 9999 },
            { complete: true },
            {},
            (err, data) => {
              expect(data).to.be.null;
              done(err);
            }
          );
        });
        it('should fail on wrong pid', function (done) {
          projects.updateTask(
            { pid: 9999, tid },
            { complete: true },
            {},
            (err, data) => {
              expect(data).to.be.null;
              done(err);
            }
          );
        });
        it('should fail on wrong pid & tid', function (done) {
          projects.updateTask(
            { pid: 9999, tid: 9999 },
            { complete: true },
            {},
            (err, data) => {
              expect(data).to.be.null;
              done(err);
            }
          );
        });
        it('should fail on missing data', function (done) {
          projects.updateTask(
            { pid, tid },
            {},
            {},
            (err, data) => {
              expect(err).to.be.object;
              expect(err.errno).to.be.equal(1);
              expect(err.code).to.be.equal('SQLITE_ERROR');
              done();
            }
          );
        });
      });
      describe('deleteTask', function () {
        let tid = null;
        const pid = 35;
        beforeEach('add the task to update', function (done) {
          projects.addTaskToProject(
            { pid },
            {
              descr: 'new task',
              complete: false
            },
            {},
            (err, data) => {
              if (err) return done(err);
              tid = data.tid;
              done();
            }
          );
        });
        it('should delete existing', function (done) {
          projects.deleteTask({ pid, tid }, {}, {}, (err, data) => {
            if (err) done(err);
            expect(data).to.be.object;
            expect(data.pid).to.equal(pid);
            expect(data.tid).to.equal(tid);
            done();
          });
        });
        it('should fail on wrong tid', function (done) {
          projects.deleteTask({ pid, tid: 9999 }, {}, {}, (err, data) => {
            expect(data).to.be.null;
            done(err);
          });
        });
        it('should fail on wrong pid', function (done) {
          projects.deleteTask({ pid: 9999, tid }, {}, {}, (err, data) => {
            expect(data).to.be.null;
            done(err);
          });
        });
        it('should fail on wrong pid & tid', function (done) {
          projects.deleteTask({ pid: 9999, tid: 9999 }, {}, {}, (err, data) => {
            expect(data).to.be.null;
            done(err);
          });
        });
      });

      describe('deleteProject', function () {
        const pid = 35;
        it('should fail on non-empty existing', function (done) {
          projects.deleteProject({ pid }, {}, {}, (err, data) => {
            expect(err).to.be.object;
            expect(err.errno).to.be.equal(19);
            expect(err.code).to.be.equal('SQLITE_CONSTRAINT');
            done();
          });
        });
        it('should succeed on forced', function (done) {
          projects.deleteProject({ pid }, {}, { forced: true }, (err, data) => {
            if (err) done(err);
            expect(data).to.be.object;
            expect(data.pid).to.equal(pid);
            done();
          });
        });
        it('should fail on non-existing', function (done) {
          projects.deleteProject({ pid: 9999 }, {}, {}, (err, data) => {
            expect(data).to.be.null;
            done(err);
          });
        });
      });
    });
  });
});
