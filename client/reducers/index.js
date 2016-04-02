import { combineReducers } from 'redux';

import projects from './projects.js';
import requests from './requests.js';
import misc from './misc.js';
import i18n from './i18n.js';

import { routerReducer } from 'react-router-redux';

export default combineReducers({
  projects,
  requests,
  misc,
  i18n,
  routing: routerReducer,
});
