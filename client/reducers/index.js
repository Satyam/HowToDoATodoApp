import { combineReducers } from 'redux';

import projects from './projects.js';
import requests from './requests.js';
import misc from './misc.js';

export default combineReducers({
  projects,
  requests,
  misc,
});
