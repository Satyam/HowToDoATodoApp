import { push } from 'react-router-redux';
import restAPI from 'client/utils/restAPI.js';
import ACTION_TYPES from './actionTypes.js';

const api = restAPI('data/v1');

const fail = (dispatch, type) => response => {
  dispatch({
    type,
    status: response.status,
    msg: response.statusText,
    url: response.config.url.replace(response.config.baseURL, ''),
  });
};

export function getAllProjects() {
  return dispatch => {
    dispatch({
      type: ACTION_TYPES.ALL_PROJECTS_REQUEST,
    });
    return api.read('/projects?fields=pid,name')
      .then(
        response => dispatch({
          type: ACTION_TYPES.ALL_PROJECTS_SUCCESS,
          data: response.data,
        }),
        fail(dispatch, ACTION_TYPES.ALL_PROJECTS_FAILURE)
      );
  };
}

export function getProjectById(pid) {
  return dispatch => {
    dispatch({
      type: ACTION_TYPES.PROJECT_BY_ID_REQUEST,
      pid,
    });
    return api.read(`/projects/${pid}`)
      .then(
        response => dispatch({
          type: ACTION_TYPES.PROJECT_BY_ID_SUCCESS,
          data: response.data,
        }),
        fail(dispatch, ACTION_TYPES.PROJECT_BY_ID_FAILURE)
      );
  };
}

export function addProject(name, descr) {
  return dispatch => {
    dispatch({
      type: ACTION_TYPES.ADD_PROJECT_REQUEST,
      name,
      descr,
    });
    return api.create('/projects', { name, descr })
      .then(
        response => dispatch({
          type: ACTION_TYPES.ADD_PROJECT_SUCCESS,
          data: Object.assign({ name, descr }, response.data),
        }),
        fail(dispatch, ACTION_TYPES.ADD_PROJECT_FAILURE)
      );
  };
}

export function updateProject(pid, name, descr) {
  return dispatch => {
    dispatch({
      type: ACTION_TYPES.UPDATE_PROJECT_REQUEST,
      name,
      descr,
    });
    return api.update(`/projects/${pid}`, { name, descr })
      .then(
        response => dispatch({
          type: ACTION_TYPES.UPDATE_PROJECT_SUCCESS,
          data: Object.assign({ name, descr }, response.data),
        }),
        fail(dispatch, ACTION_TYPES.UPDATE_PROJECT_FAILURE)
      );
  };
}

export function deleteProject(pid) {
  return dispatch => {
    dispatch({
      type: ACTION_TYPES.DELETE_PROJECT_REQUEST,
      pid,
    });
    return api.delete(`/projects/${pid}?forced=true`)
      .then(
        response => {
          dispatch(push('/project'));
          dispatch({
            type: ACTION_TYPES.DELETE_PROJECT_SUCCESS,
            data: response.data,
          });
        },
        fail(dispatch, ACTION_TYPES.DELETE_PROJECT_FAILURE)
      );
  };
}

export function addTaskToProject(pid, descr, complete) {
  return dispatch => {
    dispatch({
      type: ACTION_TYPES.ADD_TASK_REQUEST,
      pid,
      descr,
      complete,
    });
    return api.create(`/projects/${pid}`, { descr })
      .then(
        response => {
          dispatch({
            type: ACTION_TYPES.ADD_TASK_SUCCESS,
            data: { descr, complete, pid, tid: String(response.data.tid) },
          });
        },
        fail(dispatch, ACTION_TYPES.ADD_TASK_FAILURE)
      );
  };
}

export function updateTask(pid, tid, descr, complete) {
  return dispatch => {
    dispatch({
      type: ACTION_TYPES.UPDATE_TASK_REQUEST,
      pid,
      tid,
      descr,
      complete,
    });
    return api.update(`/projects/${pid}/${tid}`, { descr, complete })
      .then(
        response => {
          dispatch({
            type: ACTION_TYPES.UPDATE_TASK_SUCCESS,
            data: Object.assign({ descr, complete }, response.data),
          });
        },
        fail(dispatch, ACTION_TYPES.UPDATE_TASK_FAILURE)
      );
  };
}

export function deleteTask(pid, tid) {
  return dispatch => {
    dispatch({
      type: ACTION_TYPES.DELETE_TASK_REQUEST,
      pid,
      tid,
    });
    return api.delete(`/projects/${pid}/${tid}`)
      .then(
        response => {
          dispatch({
            type: ACTION_TYPES.DELETE_TASK_SUCCESS,
            data: response.data,
          });
        },
        fail(dispatch, ACTION_TYPES.DELETE_TASK_FAILURE)
      );
  };
}
