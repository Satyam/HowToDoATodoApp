import { combineReducers } from 'redux';

import projects from './projects.js';
import requests from './requests.js';
import misc from './misc.js';
import { routerReducer } from 'react-router-redux';

export default combineReducers({
  projects,
  requests,
  misc,
  routing: routerReducer,
});
