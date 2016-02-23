import { TOGGLE_COMPLETED } from '../actions';
import data from '../data.js';

export default (state = data, action) => {
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
