
import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import reduxThunk from 'redux-thunk';
import { createMemoryHistory, match, RouterContext } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux';

import reducers from '../client/reducers';
import clientRoutes from '../client/routes.js';
import html from './index.html.js';

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

module.exports = function (app) {
  app.use((req, res, next) => {
    const memoryHistory = createMemoryHistory(req.url);
    const store = createStore(
      reducers,
      applyMiddleware(reduxThunk, routerMiddleware(memoryHistory)/* , logger */)
    );
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
            return void next();
          }
          store.pendingPromises = [];
          renderToStaticMarkup(
            <Provider store={store}>
              <RouterContext {...renderProps} />
            </Provider>
          );

          Promise.all(store.pendingPromises).then(
            () => {
              const initialView = renderToString(
                <Provider store={store}>
                  <RouterContext {...renderProps} />
                </Provider>
              );
              const finalState = JSON.stringify(store.getState());
              res.status(200).end(html(initialView, finalState));
            },
            reason => {
              console.error(reason);
              res.status(500).end(`Internal server error \n${reason}`);
            }
          );
        } else {
          next();
        }
      }
    );
  });
};
