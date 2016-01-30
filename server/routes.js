'use strict';

const express = require('express');
const projects = require('./projects.js');

const send400 = res => void res.status(400).send('Bad request');

const testFields = /^\s*\w+\s*(,\s*\w+\s*)*$/;
const testSearch = /^\s*\w+\s*=\s*\w[\w\s]*$/;

const add$valid = (req, res, next) => {
  req.$valid = { };
  next();
};

const validatePid = (req, res, next) => {
  let pid = Number(req.params.pid);
  if (Number.isNaN(pid)) return send400(res);
  req.$valid.keys = {pid};
  next();
};

const validateTid = (req, res, next) => {
  let pid = Number(req.params.pid);
  let tid = Number(req.params.tid);
  if (Number.isNaN(pid) || Number.isNaN(tid)) return send400(res);
  req.$valid.keys = {pid, tid};
  next();
};

const validateOptions = (req, res, next) => {
  let fields = req.query.fields;
  let search = req.query.search;

  if (
    (fields && !testFields.test(fields)) ||
    (search && !testSearch.test(search))
  ) {
    return send400(res);
  }
  req.$valid.options = {fields, search};
  next();
};

const validatePrjData = (req, res, next) => {
  let name = req.body.name;
  let descr = req.body.descr;
  if (name === undefined && descr === undefined) return send400(res);
  let data = {};
  if (name !== undefined) data.name = name;
  if (descr !== undefined) data.descr = descr;
  req.$valid.data = data;
  next();
};

const validateTaskData = (req, res, next) => {
  let descr = req.body.descr;
  let complete = req.body.complete;
  if (descr === undefined && complete === undefined) return send400(res);
  let data = {};
  if (descr !== undefined) data.descr = descr;
  if (complete !== undefined) data.complete = !!complete;
  req.$valid.data = data;
  next();
};

const processPrj = op => (req, res) => {
  const valid = req.$valid;
  projects[op](valid.keys, valid.data, valid.options, (err, data) => {
    if (err) return void res.status(500).send(err);
    if (data === null) return void res.status(404).send('Item(s) not found');
    res.json(data);
  });
};

module.exports = (dataRouter, done) => {
  const projectRouter = express.Router();
  dataRouter.use('/projects', add$valid, projectRouter);

  projectRouter
    .get('/', validateOptions, processPrj('getAllProjects'))
    .get('/:pid', validatePid, processPrj('getProjectById'))
    .get('/:pid/:tid', validateTid, processPrj('getTaskByTid'))
    .post('/', validatePrjData, processPrj('addProject'))
    .post('/:pid', validatePid, validateTaskData, processPrj('addTaskToProject'))
    .put('/:pid', validatePid, validatePrjData, processPrj('updateProject'))
    .put('/:pid/:tid', validateTid, validateTaskData, processPrj('updateTask'))
    .delete('/:pid', validatePid, processPrj('deleteProject'))
    .delete('/:pid/:tid', validateTid, processPrj('deleteTask'));

  projects.init(done);
};
