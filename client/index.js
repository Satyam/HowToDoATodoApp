import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

if (process.env.NODE_ENV !== 'production') {
  window.Perf = require('react-addons-perf');
}

import createStore from './store/createStore.js';

const initialStateEl = document.getElementById('initialState');
let initialState = {};
if (initialStateEl) {
  initialState = JSON.parse(initialStateEl.innerHTML);
}
const store = createStore(
  browserHistory,
  initialState
);

const history = syncHistoryWithStore(browserHistory, store);

import { Provider, connect } from 'react-redux';
import routes from './routes.js';

import { IntlProvider } from 'react-intl';

const mapStateToProps = state => state.i18n;

const ConnectedIntlProvider = connect(
  mapStateToProps
)(IntlProvider);

const dest = document.getElementById('contents');

export default function () {
  render((
    <Provider store={store}>
      <ConnectedIntlProvider>
        <Router history={history}>
          {routes}
        </Router>
      </ConnectedIntlProvider>
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
}
