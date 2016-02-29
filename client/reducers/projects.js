import { TOGGLE_COMPLETED } from '../actions';
import data from '../data.js';
import update from 'react-addons-update';

export default (state = data, action) => {
  switch (action.type) {
    case TOGGLE_COMPLETED:
      return update(
        state,
        { [action.pid]: { tasks: { [action.tid]: { complete: { $apply: x => !x } } } } }
      );
    default:
      return state;
  }
};
