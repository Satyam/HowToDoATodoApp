'use strict';

const send400 = res => void res.status(400).send('Bad request');

const testFields = /^\s*\w+\s*(,\s*\w+\s*)*$/;
const testSearch = /^\s*\w+\s*=\s*\w[\w\s]*$/;

module.exports = {
  add$valid: (req, res, next) => {
    req.$valid = { };
    next();
  },
  validatePid: (req, res, next) => {
    let pid = Number(req.params.pid);
    if (Number.isNaN(pid)) return send400(res);
    req.$valid.keys = {pid};
    next();
  },
  validateTid: (req, res, next) => {
    let pid = Number(req.params.pid);
    let tid = Number(req.params.tid);
    if (Number.isNaN(pid) || Number.isNaN(tid)) return send400(res);
    req.$valid.keys = {pid, tid};
    next();
  },
  validateOptions: (req, res, next) => {
    let fields = req.query.fields;
    let search = req.query.search;
    let forced = !!req.query.forced;

    if (
      (fields && !testFields.test(fields)) ||
      (search && !testSearch.test(search))
    ) {
      return send400(res);
    }
    req.$valid.options = {fields, search, forced};
    next();
  },
  validatePrjData: (req, res, next) => {
    let name = req.body.name;
    let descr = req.body.descr;
    if (name === undefined && descr === undefined) return send400(res);
    let data = {};
    if (name !== undefined) data.name = name;
    if (descr !== undefined) data.descr = descr;
    req.$valid.data = data;
    next();
  },
  validateTaskData: (req, res, next) => {
    let descr = req.body.descr;
    let complete = req.body.complete;
    if (descr === undefined && complete === undefined) return send400(res);
    let data = {};
    if (descr !== undefined) data.descr = descr;
    if (complete !== undefined) data.complete = !!complete;
    req.$valid.data = data;
    next();
  }
};
