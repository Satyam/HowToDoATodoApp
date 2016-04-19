import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import { routerMiddleware, routerReducer } from 'react-router-redux';

import remoteRequests from './middleware/remoteRequests';
import projects from './projects';
import requests from './requests';
import misc from './misc';
import i18n from './i18n';

const reducers = combineReducers({
  projects,
  requests,
  misc,
  i18n,
  routing: routerReducer,
});

export default function (history, initialState = {}) {
  const mw = applyMiddleware(reduxThunk, remoteRequests, routerMiddleware(history));
  return createStore(
    reducers,
    initialState,
    (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV !== 'production' &&
      window.devToolsExtension
    )
    ? compose(mw, window.devToolsExtension())
    : mw
  );
}
