/*globals db:false */
'use strict';

const prepared = {};

module.exports = {
  init: done => {
    prepared.selectAllProjects = db.prepare('select * from projects', err => {
      if (err) return done(err);
    });
    prepared.selectProjectByPid = db.prepare('select * from projects where pid = $pid', err => {
      if (err) return done(err);
    });
    prepared.selectTasksByPid = db.prepare('select tid, descr, complete from tasks where pid = $pid', err => {
      if (err) return done(err);
    });
    prepared.selectTaskByTid = db.prepare('select * from tasks where tid = $tid', err => {
      if (err) return done(err);
    });
    prepared.createProject = db.prepare('insert into projects (name, descr) values ($name, $descr)', err => {
      if (err) return done(err);
    });
    prepared.createTask = db.prepare('insert into tasks (pid, descr, complete) values ($pid, $descr, $complete)', err => {
      if (err) return done(err);
    });
    prepared.deleteProject = db.prepare('delete from projects where pid = $pid', err => {
      if (err) return done(err);
    });
    prepared.deleteTask = db.prepare('delete from tasks where pid = $pid and tid = $tid', err => {
      if (err) return done(err);
    });
    done();
  },

  getAllProjects: (keys, data, options, done) => {
    let fields = options.fields;
    let search = options.search;
    if (!(fields || search)) {
      prepared.selectAllProjects.all(done);
    } else {
      let sql = 'select ' +
        (fields || '*') +
        ' from projects' +
         (search
           ? ' where ' + search.replace(/([^=]+)=(.+)/, '$1 like "%$2%"')
           : ''
         );
      db.all(sql, done);
    }
  },

  getProjectById: (keys, data, options, done) => {
    prepared.selectProjectByPid.get({$pid: keys.pid}, (err, prj) => {
      if (err) return done(err);
      if (!prj) return done(null, null);
      prepared.selectTasksByPid.all({$pid: keys.pid}, (err, tasks) => {
        if (err) return done(err);
        prj.tasks = tasks.reduce((prev, current) => {
          prev[current.tid] = {
            descr: current.descr,
            complete: !!current.complete
          };
          return prev;
        }, {});
        done(null, prj);
      });
    });
  },

  getTaskByTid: (keys, data, options, done) => {
    prepared.selectTaskByTid.get({$tid: keys.tid}, (err, task) => {
      if (err) return done(err);
      if (!task || task.pid !== keys.pid) return done(null, null);
      task.complete = !!task.complete;
      done(null, task);
    });
  },

  addProject: (keys, data, options, done) => {
    prepared.createProject.run({
      $name: data.name || 'New Project',
      $descr: data.descr || 'No description'
    }, function (err) {
      if (err) return done(err);
      done(null, {pid: this.lastID});
    });
  },

  addTaskToProject: (keys, data, options, done) => {
    prepared.selectProjectByPid.get({$pid: keys.pid}, (err, prj) => {
      if (err) return done(err);
      if (!prj) return done(null, null);
      prepared.createTask.run({
        $descr: data.descr || 'No description',
        $complete: data.complete || 0,
        $pid: keys.pid
      }, function (err) {
        if (err) return done(err);
        done(null, {tid: this.lastID});
      });
    });
  },

  updateProject: (keys, data, options, done) => {
    let sql = 'update projects set ' +
      Object.keys(data).map(field => `${field} = $${field}`).join(', ') +
     ' where pid = $pid';
    console.log('updateProject', sql);
    db.run(sql, {
      $descr: data.descr,
      $name: data.name,
      $pid: keys.pid
    }, function (err) {
      if (err) {
        if (err.errno === 25) {
          done(null, null);
        } else done(err);
        return;
      }
      if (this.changes) {
        done(null, keys);
      } else {
        done(null, null);
      }
    });
  },

  updateTask: (keys, data, options, done) => {
    let sql = 'update tasks set ' +
    Object.keys(data).map(field => `${field} = $${field}`).join(', ') +
    ' where pid = $pid and tid = $tid';
    db.run(sql, {
      $descr: data.descr,
      $complete: data.complete,
      $pid: keys.pid,
      $tid: keys.tid
    }, function (err) {
      if (err) {
        if (err.errno === 25) {
          done(null, null);
        } else done(err);
        return;
      }
      if (this.changes) {
        done(null, keys);
      } else {
        done(null, null);
      }
    });
  },

  deleteProject: (keys, data, options, done) => {
    prepared.deleteProject.run({
      $pid: keys.pid
    }, function (err) {
      if (err) return done(err);
      if (this.changes) {
        done(null, keys);
      } else {
        done(null, null);
      }
    });
  },

  deleteTask: (keys, data, options, done) => {
    prepared.deleteTask.run({
      $pid: keys.pid,
      $tid: keys.tid
    }, function (err) {
      if (err) return done(err);
      if (this.changes) {
        done(null, keys);
      } else {
        done(null, null);
      }
    });
  }
};
