import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import { routerMiddleware } from 'react-router-redux';

export default function (reducers, history, initialState = {}) {
  const mw = applyMiddleware(reduxThunk, routerMiddleware(history));
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
