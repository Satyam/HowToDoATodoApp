import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux';

if (process.env.NODE_ENV !== 'production') {
  window.Perf = require('react-addons-perf');
}

import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import reducers from './reducers';

const store = createStore(
  reducers,
  compose(
    applyMiddleware(reduxThunk, routerMiddleware(browserHistory)),
    process.env.NODE_ENV !== 'production' && window.devToolsExtension
    ? window.devToolsExtension()
    : undefined
  )
);

const history = syncHistoryWithStore(browserHistory, store);

import { Provider } from 'react-redux';

import App from './components/app.js';
import ProjectList from './components/projectList.js';
import Project from './components/project.js';
import NotFound from './components/notFound.js';
import EditProject from './components/editProject.js';

render((
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}>
        <Route path="project" component={ProjectList}>
          <Route path="newProject" component={EditProject} />
          <Route path="editProject/:pid" component={EditProject} />
          <Route path=":pid" component={Project} />
        </Route>
        <Route path="*" component={NotFound} />
      </Route>
    </Router>
  </Provider>
), document.getElementById('contents'));
