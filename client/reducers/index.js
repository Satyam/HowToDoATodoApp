import { combineReducers } from 'redux';

import projects from './projects.js';
import requests from './requests.js';

export default combineReducers({
  projects,
  requests,
});
