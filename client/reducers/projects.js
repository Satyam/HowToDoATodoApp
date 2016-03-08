import update from 'react-addons-update';

import {
  TOGGLE_COMPLETED,
  ALL_PROJECTS_SUCCESS,
  PROJECT_BY_ID_SUCCESS,
} from '../actions';

export default (state = {}, action) => {
  switch (action.type) {
    case TOGGLE_COMPLETED:
      return update(
        state,
        { [action.pid]: { tasks: { [action.tid]: { complete: { $apply: x => !x } } } } }
      );
    case ALL_PROJECTS_SUCCESS:
      return action.data.reduce(
        (prjs, prj) => (prjs[prj.pid]
          ? prjs
          : update(prjs, { $merge: { [prj.pid]: prj } })
        ),
        state
      );
    case PROJECT_BY_ID_SUCCESS:
      return update(state, { [action.data.pid]: { $set: action.data } });
    default:
      return state;
  }
};
