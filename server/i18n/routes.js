'use strict';
const express = require('express');

module.exports = (branch, dataRouter) => new Promise((resolve, reject) => {
  const i18nRouter = express.Router();

  dataRouter.use(branch, i18nRouter);

  i18nRouter
    .get('/locale/:locale', function (req, res) {
      const locale = req.params.locale;
      req.session.locale = locale;
      res.json({locale});
    });

  resolve();
});
