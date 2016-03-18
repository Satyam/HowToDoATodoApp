import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux';

if (process.env.NODE_ENV !== 'production') {
  window.Perf = require('react-addons-perf');
}

import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import reducers from './reducers';

const initialStateEl = document.getElementById('initialState');
let initialState = {};
if (initialStateEl) {
  initialState = JSON.parse(initialStateEl.innerHTML);
}
const store = createStore(
  reducers,
  initialState,
  compose(
    applyMiddleware(reduxThunk, routerMiddleware(browserHistory)),
    process.env.NODE_ENV !== 'production' && window.devToolsExtension
    ? window.devToolsExtension()
    : undefined
  )
);

store.pendingPromises = [];

const history = syncHistoryWithStore(browserHistory, store);

import { Provider } from 'react-redux';
import routes from './routes.js';

const dest = document.getElementById('contents');

render((
  <Provider store={store}>
    <Router history={history}>
      {routes}
    </Router>
  </Provider>
), dest);

if (process.env.NODE_ENV !== 'production') {
  if (
    !dest ||
    !dest.firstChild ||
    !dest.firstChild.attributes ||
    !dest.firstChild.attributes['data-react-checksum']
  ) {
    console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.'); // eslint-disable-line
  }
}
