/* globals describe:false, it:false, before:false, after:false, beforeEach:false, afterEach:false, db:false */
'use strict';
const chai = require('chai');
const expect = chai.expect;
const axios = require('axios');

const server = require('..');

const PORT = process.env.npm_package_myServerApp_port || 8080;

describe('Server testing', function () {
  before('Starting server', function (done) {
    server.start(done);
  });

  after('Closing the server', function (done) {
    db.all('PRAGMA integrity_check', (err, list) => {
      if (err) return done(err);
      expect(list).to.be.an.instanceof(Array);
      expect(list).to.have.length(1);
      expect(list[0]).to.be.an.instanceof(Object);
      expect(list[0].integrity_check).to.equal('ok');
      db.all('PRAGMA foreign_key_check', (err, list) => {
        if (err) return done(err);
        expect(list).to.be.an.instanceof(Array);
        expect(list).to.have.length(0);
        server.stop(done);
      });
    });
  });

  describe('Static pages test', function () {
    const http = axios.create({
      baseURL: `http://localhost:${PORT}`
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

  describe('/data/v1 REST API test', function () {
    const http = axios.create({
      baseURL: `http://localhost:${PORT}/data/v1`,
      responseType: 'json'
    });

    it('Get on /projects should return project list', function () {
      return http.get('/projects')
        .then(
          response => {
            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.contain('application/json');
            let data = response.data;
            expect(data).to.be.an.instanceof(Array);
            expect(data).to.have.length(2);
            data.forEach(prj => {
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
          }
        );
    });

    it('Get on /projects with search term should return sought result', function () {
      return http.get('/projects?search=name%3Domelette')
        .then(response => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('application/json');
          let data = response.data;
          expect(data).to.be.an.instanceof(Array);
          expect(data).to.have.length(1);
          let prj = data[0];
          expect(prj.pid).to.equal(34);
          expect(prj.name).to.contain('Spanish omelette');
          expect(prj.descr).to.contain('Spanish omelette');
        });
    });

    it('SQL injection ', function () {
      return http.get('/projects?fields=* from sqlite_master;select *')
      .then(
        response => {
          throw new Error('Should not have let it go');
        },
        response => {
          expect(response.status).to.equal(400);
        }
      );
    });

    it('Get on /projects for some fields should return only those', function () {
      return http.get('/projects?fields=name,pid')
        .then(response => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('application/json');
          let data = response.data;
          expect(data).to.be.an.instanceof(Array);
          expect(data).to.have.length(2);
          data.forEach(prj => {
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
        });
    });

    it('Get on /projects with search and fields', function () {
      return http.get('/projects?search=name%3Domelette&fields=pid')
        .then(response => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('application/json');
          let data = response.data;
          expect(data).to.be.an.instanceof(Array);
          expect(data).to.have.length(1);
          let prj = data[0];
          expect(prj.pid).to.equal(34);
          expect(prj.name).to.be.undefined;
          expect(prj.descr).to.be.undefined;
        });
    });

    it('Get on /projects/25 should return that project', function () {
      return http.get('/projects/25')
        .then(response => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('application/json');
          let data = response.data;
          expect(data.name).to.equal('Writing a Book on Web Dev Tools');
          expect(data.descr).to.equal('Tasks required to write a book on the tools required to develop a web application');
          expect(data.tasks).to.be.an.instanceof(Object);
          let tasks = data.tasks;
          expect(tasks).to.have.all.keys('1', '2', '3');
          expect(tasks[1]).to.be.an.instanceof(Object);
          expect(tasks[1].descr).to.equal('Figure out what kind of application to develop');
          expect(tasks[1].complete).to.be.true;
        });
    });

    it('Get on /projects/34/5 should return a task', function () {
      return http.get('/projects/34/5')
        .then(response => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('application/json');
          let data = response.data;
          expect(data.descr).to.equal('Fry the potatoes');
          expect(data.complete).to.be.true;
        });
    });

    it('Get on /projects/99 should fail', function () {
      return http.get('/projects/99')
        .then(
          response => {
            throw new Error('Should not have found it');
          },
          response => {
            expect(response.status).to.equal(404);
            expect(response.data).to.equal('Project 99 not found');
          }
        );
    });

    it('Get on /projects/34/99 should fail', function () {
      return http.get('/projects/34/99')
        .then(
          response => {
            throw new Error('Should not have found it');
          },
          response => {
            expect(response.status).to.equal(404);
            expect(response.data).to.equal('Task 99 in project 34 not found');
          }
        );
    });

    it('Get on /projects/99/99 should fail', function () {
      return http.get('/projects/99/99')
        .then(
          response => {
            throw new Error('Should not have found it');
          },
          response => {
            expect(response.status).to.equal(404);
            expect(response.data).to.equal('Task 99 in project 99 not found');
          }
        );
    });

    it('Post on /projects/99 should fail', function () {
      return http.post('/projects/99')
        .then(
          response => {
            throw new Error('Should not have found it');
          },
          response => {
            expect(response.status).to.equal(404);
            expect(response.data).to.equal('Project 99 not found');
          }
        );
    });

    it('Put on /projects/99 should fail', function () {
      return http.put('/projects/99', {descr: ''})
        .then(
          response => {
            throw new Error('Should not have found it');
          },
          response => {
            expect(response.status).to.equal(404);
            expect(response.data).to.equal('Project 99 not found');
          }
        );
    });

    it('Put on /projects/34/99 should fail', function () {
      return http.put('/projects/34/99', {descr: ''})
        .then(
          response => {
            throw new Error('Should not have found it');
          },
          response => {
            expect(response.status).to.equal(404);
            expect(response.data).to.equal('Task 99 in project 34 not found');
          }
        );
    });

    it('Put on /projects/99/99 should fail', function () {
      return http.put('/projects/99/99', {descr: ''})
        .then(
          response => {
            throw new Error('Should not have found it');
          },
          response => {
            expect(response.status).to.equal(404);
            expect(response.data).to.equal('Task 99 in project 99 not found');
          }
        );
    });

    it('Delete on /projects/99 should fail', function () {
      return http.delete('/projects/99')
        .then(
          response => {
            throw new Error('Should not have found it');
          },
          response => {
            expect(response.status).to.equal(404);
            expect(response.data).to.equal('Project 99 not found');
          }
        );
    });

    it('Delete on /projects/34/99 should fail', function () {
      return http.delete('/projects/34/99')
        .then(
          response => {
            throw new Error('Should not have found it');
          },
          response => {
            expect(response.status).to.equal(404);
            expect(response.data).to.equal('Task 99 in project 34 not found');
          }
        );
    });

    it('Delete on /projects/99/99 should fail', function () {
      return http.delete('/projects/99/99')
        .then(
          response => {
            throw new Error('Should not have found it');
          },
          response => {
            expect(response.status).to.equal(404);
            expect(response.data).to.equal('Task 99 in project 99 not found');
          }
        );
    });

    describe('Creating and manipulating projects', function () {
      let pid;

      beforeEach('Create a new project', function () {
        return http.post('/projects', {
          name: 'new project',
          descr: 'new project for testing'
        })
        .then(response => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('application/json');
          let data = response.data;
          expect(data).to.be.an.instanceof(Object);
          expect(data.pid).to.exist;
          pid = data.pid;
        });
      });

      afterEach('Delete the project', function () {
        return http.delete(`/projects/${pid}`)
          .then(response => {
            expect(response.status).to.equal(200);
            expect(response.headers['content-length']).to.equal('0');
          });
      });

      it('New project should exist', function () {
        return http.get(`/projects/${pid}`)
          .then(response => {
            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.contain('application/json');
            let data = response.data;
            expect(data.name).to.be.equal('new project');
            expect(data.descr).to.be.equal('new project for testing');
            expect(data.tasks).to.be.instanceof(Object);
            expect(data.tasks).to.be.empty;
          });
      });

      it('Change the project name', function () {
        return http.put(`/projects/${pid}`, {name: 'changed name'})
          .then(response => {
            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.contain('application/json');
            let data = response.data;
            expect(parseInt(data.pid, 10)).to.be.equal(pid);
          })
          .then(() => {
            return http.get(`/projects/${pid}`)
              .then(response => {
                expect(response.status).to.equal(200);
                expect(response.headers['content-type']).to.contain('application/json');
                let data = response.data;
                expect(data.name).to.be.equal('changed name');
                expect(data.descr).to.be.equal('new project for testing');
              });
          });
      });

      it('Change the project description', function () {
        return http.put(`/projects/${pid}`, {descr: 'changed description'})
          .then(response => {
            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.contain('application/json');
            let data = response.data;
            expect(parseInt(data.pid, 10)).to.be.equal(pid);
          })
          .then(() => {
            return http.get(`/projects/${pid}`)
              .then(response => {
                expect(response.status).to.equal(200);
                expect(response.headers['content-type']).to.contain('application/json');
                let data = response.data;
                expect(data.name).to.be.equal('new project');
                expect(data.descr).to.be.equal('changed description');
              });
          });
      });

      describe('Managing tasks within project', function () {
        let tid;

        beforeEach('Add a task', function () {
          return http.post(`/projects/${pid}`, {
            descr: 'some task'
          })
            .then(response => {
              expect(response.status).to.equal(200);
              expect(response.headers['content-type']).to.contain('application/json');
              let data = response.data;
              expect(data).to.be.an.instanceof(Object);
              expect(data.tid).to.exist;
              tid = data.tid;
            });
        });

        afterEach('Delete the task', function () {
          return http.delete(`/projects/${pid}/${tid}`)
            .then(response => {
              expect(response.status).to.equal(200);
              expect(response.headers['content-length']).to.equal('0');
            });
        });

        it('New task should exist', function () {
          return http.get(`/projects/${pid}/${tid}`)
            .then(response => {
              expect(response.status).to.equal(200);
              expect(response.headers['content-type']).to.contain('application/json');
              let data = response.data;
              expect(data.descr).to.be.equal('some task');
              expect(data.complete).to.be.false;
            });
        });

        it('Mark the task complete', function () {
          return http.put(`/projects/${pid}/${tid}`, {complete: true})
          .then(response => {
            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.contain('application/json');
            let data = response.data;
            expect(parseInt(data.pid, 10)).to.be.equal(pid);
            expect(parseInt(data.tid, 10)).to.be.equal(tid);
          })
          .then(() => {
            return http.get(`/projects/${pid}/${tid}`)
              .then(response => {
                expect(response.status).to.equal(200);
                expect(response.headers['content-type']).to.contain('application/json');
                let data = response.data;
                expect(data.descr).to.be.equal('some task');
                expect(data.complete).to.be.true;
              });
          });
        });
      });
    });
  });
});
