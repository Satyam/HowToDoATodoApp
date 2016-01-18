/*global data:false */
module.exports = router => {
  // Routes for projects
  router.get('/projects', (req, res) => {
    res.send(Object.keys(data).map(pid => ({
      pid: pid,
      name: data[pid].name,
      descr: data[pid].descr
    })));
  });

  router.get('/projects/:pid', (req, res) => {
    let prj = data[req.params.pid];
    if (prj) {
      res.send(prj);
    } else {
      res.status(404).send(`project ${req.params.pid} not found`);
    }
  });

  router.get('/projects/:pid/:tid', (req, res) => {
    let prj = data[req.params.pid];
    if (prj) {
      let task = prj.tasks[req.params.tid];
      if (task) {
        res.send(task);
      } else {
        res.status(404).send(`Task ${req.params.tid} not found`);
      }
    } else {
      res.status(404).send(`project ${req.params.pid} not found`);
    }
  });

  router.post('/projects', (req, res) => {
    let pid = Object.keys(data).length;
    while (pid in data) pid++;
    let prj = Object.assign({
      name: '',
      descr: ''
    }, req.body || {});
    data[pid] = prj;
    res.send({
      pid: pid
    });
  });

  router.post('/projects/:pid', (req, res) => {
    let prj = data[req.params.pid];
    if (prj) {
      let tid = Object.keys(prj).length;
      while (tid in prj) tid++;
      prj[tid] = Object.assign({
        descr: '',
        complete: false
      }, req.body || {});
      res.send({
        tid: tid
      });
    } else {
      res.status(404).send(`project ${req.params.pid} not found`);
    }
  });

  router.put('/projects/:pid', (req, res) => {
    let prj = data[req.params.pid];
    if (prj) {
      Object.assign(prj, req.body || {});
      res.send(prj);
    } else {
      res.status(404).send(`project ${req.params.pid} not found`);
    }
  });

  router.put('/projects/:pid/:tid', (req, res) => {
    let prj = data[req.params.pid];
    if (prj) {
      let task = prj.tasks[req.params.tid];
      if (task) {
        Object.assign(task, req.body || {});
        res.send(task);
      } else {
        res.status(404).send(`Task ${req.params.tid} not found`);
      }
    } else {
      res.status(404).send(`project ${req.params.pid} not found`);
    }
  });

  router.delete('/projects/:pid', (req, res) => {
    if (req.params.pid in data) {
      delete data[req.params.pid];
    } else {
      res.status(404).send(`project ${req.params.pid} not found`);
    }
  });

  router.delete('/projects/:pid/:tid', (req, res) => {
    let prj = data[req.params.pid];
    if (prj) {
      if (req.params.tid in prj) {
        delete prj[req.params.tid];
      } else {
        res.status(404).send(`Task ${req.params.tid} not found`);
      }
    } else {
      res.status(404).send(`project ${req.params.pid} not found`);
    }
  });
};
