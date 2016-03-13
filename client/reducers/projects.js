import update from 'react-addons-update';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

import {
  TOGGLE_COMPLETED,
  ALL_PROJECTS_SUCCESS,
  PROJECT_BY_ID_SUCCESS,
  ADD_PROJECT_SUCCESS,
  UPDATE_PROJECT_SUCCESS,
  DELETE_PROJECT_SUCCESS,
  ADD_TASK_SUCCESS,
  UPDATE_TASK_SUCCESS,
  DELETE_TASK_SUCCESS,
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
    case ADD_PROJECT_SUCCESS:
      return update(state, { $merge: { [action.data.pid]: action.data } });
    case UPDATE_PROJECT_SUCCESS:
      return update(state, { [action.data.pid]: { $set: action.data } });
    case DELETE_PROJECT_SUCCESS:
      return omit(state, action.data.pid);
    case ADD_TASK_SUCCESS:
      return update(state, {
        [action.data.pid]: { tasks: { $merge: { [action.data.tid]: action.data } } },
      });
    case UPDATE_TASK_SUCCESS:
      return update(state, {
        [action.data.pid]: {
          tasks: { [action.data.tid]: { $set: pick(action.data, 'descr', 'complete') } },
        },
      });
    case DELETE_TASK_SUCCESS:
      return update(state, {
        [action.data.pid]: { tasks: { $apply: tasks => omit(tasks, action.data.tid) } },
      });
    default:
      return state;
  }
};
