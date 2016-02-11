import React from 'react';
import { render } from 'react-dom';
import { Router } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';

const Index = require('./index.js');
const Project = require('./project.js');

const App = props => props.children;

const routeConfig = {
  path: '/',
  component: App,
  indexRoute: { component: Index },
  childRoutes: [
    { path: 'index', component: Index },
    { path: 'project/:pid', component: Project }
  ]
};

render(
  React.createElement(
    Router,
    {
      routes: routeConfig,
      history: createBrowserHistory()
    }
  ),
  document.getElementById('contents')
);
