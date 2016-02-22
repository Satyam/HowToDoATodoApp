import { createStore } from 'redux';
import data from './data.js';

import { TOGGLE_COMPLETED } from './actions.js';

const reducer = (state, action) => {
  switch (action.type) {
    case TOGGLE_COMPLETED: {
      const pid = action.pid;
      const tid = action.tid;
      const copy = Object.assign({}, state);
      copy[pid].tasks[tid].complete = !state[pid].tasks[tid].complete;
      return copy;
    }
    default:
      return state;
  }
};

export default createStore(reducer, data);
