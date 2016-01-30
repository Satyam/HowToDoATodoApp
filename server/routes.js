'use strict';

const express = require('express');
const projects = require('./projects.js');

const processPrj = (op, res, keys, data, options) => {
  projects[op](keys, data, options, (err, data) => {
    if (err) return void res.status(500).send(err);
    if (data === null) return void res.status(404).send('Item(s) not found');
    res.json(data);
  });
};

const send400 = res => void res.status(400).send('Bad request');

const testFields = /^\s*\w+\s*(,\s*\w+\s*)*$/;
const testSearch = /^\s*\w+\s*=\s*\w[\w\s]*$/;

module.exports = (dataRouter, done) => {
  const projectRouter = express.Router();
  dataRouter.use('/projects', projectRouter);

  projectRouter.get('/', (req, res) => {
    let fields = req.query.fields;
    let search = req.query.search;

    if (
      (fields && !testFields.test(fields)) ||
      (search && !testSearch.test(search))
    ) {
      return send400(res);
    }
    processPrj('getAllProjects', res, null, null, {fields, search});
  });

  projectRouter.get('/:pid', (req, res) => {
    let pid = Number(req.params.pid);
    if (Number.isNaN(pid)) return send400(res);
    processPrj('getProjectById', res, {pid});
  });

  projectRouter.get('/:pid/:tid', (req, res) => {
    let pid = Number(req.params.pid);
    let tid = Number(req.params.tid);
    if (Number.isNaN(pid) || Number.isNaN(tid)) return send400(res);
    processPrj('getTaskByTid', res, {pid, tid});
  });

  projectRouter.post('/', (req, res) => {
    let name = req.body.name;
    let descr = req.body.descr;
    if (name === undefined && descr === undefined) return send400(res);
    let data = {};
    if (name !== undefined) data.name = name;
    if (descr !== undefined) data.descr = descr;
    processPrj('addProject', res, null, data);
  });

  projectRouter.post('/:pid', (req, res) => {
    let pid = Number(req.params.pid);
    if (Number.isNaN(pid)) return send400(res);
    let descr = req.body.descr;
    let complete = req.body.complete;
    if (descr === undefined && complete === undefined) return send400(res);
    let data = {};
    if (descr !== undefined) data.descr = descr;
    if (complete !== undefined) data.complete = !!complete;
    processPrj('addTaskToProject', res, {pid}, data);
  });

  projectRouter.put('/:pid', (req, res) => {
    let pid = Number(req.params.pid);
    if (Number.isNaN(pid)) return send400(res);
    let name = req.body.name;
    let descr = req.body.descr;
    if (name === undefined && descr === undefined) return send400(res);
    let data = {};
    if (name !== undefined) data.name = name;
    if (descr !== undefined) data.descr = descr;
    processPrj('updateProject', res, {pid}, data);
  });

  projectRouter.put('/:pid/:tid', (req, res) => {
    let pid = Number(req.params.pid);
    let tid = Number(req.params.tid);
    if (Number.isNaN(pid) || Number.isNaN(tid)) return send400(res);
    let descr = req.body.descr;
    let complete = req.body.complete;
    if (descr === undefined && complete === undefined) return send400(res);
    let data = {};
    if (descr !== undefined) data.descr = descr;
    if (complete !== undefined) data.complete = !!complete;
    processPrj('updateTask', res, {pid, tid}, data);
  });

  projectRouter.delete('/:pid', (req, res) => {
    let pid = Number(req.params.pid);
    if (Number.isNaN(pid)) return send400(res);
    processPrj('deleteProject', res, {pid});
  });

  projectRouter.delete('/:pid/:tid', (req, res) => {
    let pid = Number(req.params.pid);
    let tid = Number(req.params.tid);
    if (Number.isNaN(pid) || Number.isNaN(tid)) return send400(res);
    processPrj('deleteTask', res, {pid, tid});
  });
  projects.init(done);
};
