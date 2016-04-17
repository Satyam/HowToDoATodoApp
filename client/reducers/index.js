import { combineReducers } from 'redux';

import projects from 'client/store/projects/reducers.js';
import requests from 'client/store/requests';
import misc from 'client/store/misc';
import i18n from 'client/store/i18n';

import { routerReducer } from 'react-router-redux';

export default combineReducers({
  projects,
  requests,
  misc,
  i18n,
  routing: routerReducer,
});
