
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createMemoryHistory, match, RouterContext } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import { IntlProvider } from 'react-intl';

import createStore from 'client/store/createStore.js';

import clientRoutes from 'client/routes.js';
import html from '../index.html.js';
import { setLocale } from 'client/actions';

import localesSupported from 'client/messages/localesSupported.js';

import { connect } from 'react-redux';

const mapStateToProps = state => state.i18n;

const ConnectedIntlProvider = connect(
  mapStateToProps
)(IntlProvider);

module.exports = app => {
  app.use((req, res, next) => {
    const memoryHistory = createMemoryHistory(req.url);
    const store = createStore(memoryHistory);
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
            Promise.all(renderProps.routes.map(route => {
              const serverInit = route.component.WrappedComponent.serverInit;
              return typeof serverInit === 'function'
              ? serverInit(store.dispatch, renderProps)
              : undefined;
            })).then(
              () => {
                const initialView = renderToString(
                  <Provider store={store}>
                    <ConnectedIntlProvider initialNow={Date.now()}>
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
