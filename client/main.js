import React from 'react';
import { render } from 'react-dom';
import { Router, Route } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';

import App from './app.js';
import ProjectList from './projectList.js';
import Project from './project.js';
import NotFound from './notFound.js';

render((
  <Router history={createBrowserHistory()}>
    <Route path="/" component={App}>
      <Route path="project" component={ProjectList}>
        <Route path=":pid" component={Project}/>
      </Route>
      <Route path="*" component={NotFound}/>
    </Route>
  </Router>
), document.getElementById('contents'));