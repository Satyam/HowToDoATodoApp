import update from 'react-addons-update';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import ACTION_TYPES from './actionTypes.js';

export default (state = {}, action) => {
  switch (action.type) {
    case ACTION_TYPES.ALL_PROJECTS_SUCCESS:
      return action.data.reduce(
        (prjs, prj) => (prjs[prj.pid]
          ? prjs
          : update(prjs, { $merge: { [prj.pid]: prj } })
        ),
        state
      );
    case ACTION_TYPES.PROJECT_BY_ID_SUCCESS:
      return update(state, { [action.data.pid]: { $set: action.data } });
    case ACTION_TYPES.ADD_PROJECT_SUCCESS:
      return update(state, { $merge: { [action.data.pid]: action.data } });
    case ACTION_TYPES.UPDATE_PROJECT_SUCCESS:
      return update(state, { [action.data.pid]: { $set: action.data } });
    case ACTION_TYPES.DELETE_PROJECT_SUCCESS:
      return omit(state, action.data.pid);
    case ACTION_TYPES.ADD_TASK_SUCCESS:
      return update(state, {
        [action.data.pid]: { tasks: { $merge: { [action.data.tid]: action.data } } },
      });
    case ACTION_TYPES.UPDATE_TASK_SUCCESS:
      return update(state, {
        [action.data.pid]: {
          tasks: { [action.data.tid]: { $set: pick(action.data, 'descr', 'complete') } },
        },
      });
    case ACTION_TYPES.DELETE_TASK_SUCCESS:
      return update(state, {
        [action.data.pid]: { tasks: { $apply: tasks => omit(tasks, action.data.tid) } },
      });
    default:
      return state;
  }
};
