import React from 'react';
import { render } from 'react-dom';
import { Router, Route } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';

if (process.env.NODE_ENV !== 'production') {
  window.Perf = require('react-addons-perf');
}

import { createStore } from 'redux';
import reducers from './reducers';

const store = createStore(
  reducers,
  process.env.NODE_ENV !== 'production' && window.devToolsExtension
  ? window.devToolsExtension()
  : undefined
);

import { Provider } from 'react-redux';

import App from './components/app.js';
import ProjectList from './components/projectList.js';
import Project from './components/project.js';
import NotFound from './components/notFound.js';

render((
  <Provider store={store}>
    <Router history={createBrowserHistory()}>
      <Route path="/" component={App}>
        <Route path="project" component={ProjectList}>
          <Route path=":pid" component={Project}/>
        </Route>
        <Route path="*" component={NotFound}/>
      </Route>
    </Router>
  </Provider>
), document.getElementById('contents'));
