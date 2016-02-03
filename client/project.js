'use strict';
const axios = require('axios');
module.exports = function () {
  axios.get(`/data/v1/projects/${window.location.search.substr(1)}`)
    .then(response => {
      let prj = response.data;
      document.getElementById('contents').innerHTML =
        `<h1>${prj.name}</h1><p>${prj.descr}</p><ul>${
          Object.keys(prj.tasks).reduce((prev, tid) => {
            let task = prj.tasks[tid];
            return prev + `<li><input type="checkbox" ${
              task.complete ? 'checked' : ''
            } /> &nbsp; ${task.descr}</li>`;
          }, '')
        }</ul>`;
      document.title = `Project ${prj.pid}: ${prj.name}`;
    });
};
