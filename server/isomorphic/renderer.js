
import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import reduxThunk from 'redux-thunk';
import { createMemoryHistory, match, RouterContext } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux';
import { IntlProvider } from 'react-intl';

import reducers from '../../client/reducers';
import clientRoutes from '../../client/routes.js';
import html from '../index.html.js';
import { setLocale } from '../../client/actions';

import localesSupported from '../../client/messages/localesSupported.js';

// const logger = store => next => action => {
//   if (action.type) {
//     console.info('dispatching', action.type, action);
//   }
//   const result = next(action);
//   if (action.type) {
//     console.log('next state', action.type, store.getState());
//   }
//   return result;
// };

import { connect } from 'react-redux';

const mapStateToProps = state => state.i18n;

const ConnectedIntlProvider = connect(
  mapStateToProps
)(IntlProvider);

module.exports = app => {
  app.use((req, res, next) => {
    const memoryHistory = createMemoryHistory(req.url);
    const store = createStore(
      reducers,
      applyMiddleware(reduxThunk, routerMiddleware(memoryHistory)/* , logger */)
    );
    const session = req.session;
    const locale = session.locale
      ? session.locale
      : session.locale = req.acceptsLanguages(localesSupported);
    store.dispatch(setLocale(locale));
    const history = syncHistoryWithStore(memoryHistory, store);
    match(
      { history, routes: clientRoutes, location: req.url },
      (err, redirectLocation, renderProps) => {
        if (err) {
          console.error(err);
          res.status(500).end('Internal server error');
        } else if (redirectLocation) {
          res.redirect(302, redirectLocation.pathname + redirectLocation.search);
        } else if (renderProps) {
          if (renderProps.routes.find(route => route.path === '*')) {
            next();
          } else {
            store.pendingPromises = [];
            const initialNow = Date.now();
            renderToStaticMarkup(
              <Provider store={store}>
                <ConnectedIntlProvider initialNow={initialNow}>
                  <RouterContext {...renderProps} />
                </ConnectedIntlProvider>
              </Provider>
            );

            Promise.all(store.pendingPromises).then(
              () => {
                const initialView = renderToString(
                  <Provider store={store}>
                    <ConnectedIntlProvider initialNow={initialNow}>
                      <RouterContext {...renderProps} />
                    </ConnectedIntlProvider>
                  </Provider>
                );
                const finalState = JSON.stringify(store.getState());
                res.status(200).type('html').end(html(initialView, finalState, locale));
              },
              reason => {
                console.error(reason);
                res.status(500).end(`Internal server error \n${reason}`);
              }
            );
          }
        } else {
          next();
        }
      }
    );
  });
};
