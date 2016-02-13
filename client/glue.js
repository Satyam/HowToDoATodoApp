import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';

import Index from './index.js';
import Project from './project.js';

const App = props => props.children;
const NotFound = () => (<h1>Not found</h1>);

render((
  <Router history={createBrowserHistory()}>
    <Route path="/" component={App}>
      <IndexRoute component={Index} />
      <Route path="index" component={Index}/>
      <Route path="project/:pid" component={Project}/>
      <Route path="*" component={NotFound}/>
    </Route>
  </Router>
), document.getElementById('contents'));
