import axios from 'axios';
import { push } from './';

const PORT = process.env.npm_package_myServerApp_port || 8080;

const http = axios.create({
  baseURL: `${global.window ? window.location.origin : `http://localhost:${PORT}`}/data/v1`,
  responseType: 'json',
});

const fail = (dispatch, type) => response => {
  dispatch({
    type,
    status: response.status,
    msg: response.statusText,
    url: response.config.url.replace(response.config.baseURL, ''),
  });
  throw new Error(response.statusText);
};

export const ALL_PROJECTS_REQUEST = '[REQUEST] Project list';
export const ALL_PROJECTS_SUCCESS = '[SUCCESS] Project list received';
export const ALL_PROJECTS_FAILURE = '[FAILURE] Project list request failed';

export function getAllProjects() {
  return dispatch => {
    dispatch({
      type: ALL_PROJECTS_REQUEST,
    });
    return http.get('/projects?fields=pid,name')
      .then(
        response => dispatch({
          type: ALL_PROJECTS_SUCCESS,
          data: response.data,
        }),
        fail(dispatch, ALL_PROJECTS_FAILURE)
      );
  };
}

export const PROJECT_BY_ID_REQUEST = '[REQUEST] Project info';
export const PROJECT_BY_ID_SUCCESS = '[SUCCESS] Project info received';
export const PROJECT_BY_ID_FAILURE = '[FAILURE] Project info request failed';

export function getProjectById(pid) {
  return dispatch => {
    dispatch({
      type: PROJECT_BY_ID_REQUEST,
      pid,
    });
    return http.get(`/projects/${pid}`)
      .then(
        response => dispatch({
          type: PROJECT_BY_ID_SUCCESS,
          data: response.data,
        }),
        fail(dispatch, PROJECT_BY_ID_FAILURE)
      );
  };
}

export const ADD_PROJECT_REQUEST = '[REQUEST] Add Project';
export const ADD_PROJECT_SUCCESS = '[SUCCESS] Add Project received';
export const ADD_PROJECT_FAILURE = '[FAILURE] Add Project request failed';

export function addProject(name, descr) {
  return dispatch => {
    dispatch({
      type: ADD_PROJECT_REQUEST,
      name,
      descr,
    });
    return http.post('/projects', { name, descr })
      .then(
        response => dispatch({
          type: ADD_PROJECT_SUCCESS,
          data: Object.assign({ name, descr }, response.data),
        }),
        fail(dispatch, ADD_PROJECT_FAILURE)
      );
  };
}

export const UPDATE_PROJECT_REQUEST = '[REQUEST] Update Project';
export const UPDATE_PROJECT_SUCCESS = '[SUCCESS] Update Project received';
export const UPDATE_PROJECT_FAILURE = '[FAILURE] Update Project request failed';

export function updateProject(pid, name, descr) {
  return dispatch => {
    dispatch({
      type: UPDATE_PROJECT_REQUEST,
      name,
      descr,
    });
    return http.put(`/projects/${pid}`, { name, descr })
      .then(
        response => dispatch({
          type: UPDATE_PROJECT_SUCCESS,
          data: Object.assign({ name, descr }, response.data),
        }),
        fail(dispatch, UPDATE_PROJECT_FAILURE)
      );
  };
}

export const DELETE_PROJECT_REQUEST = '[REQUEST] Delete Project';
export const DELETE_PROJECT_SUCCESS = '[SUCCESS] Delete Project received';
export const DELETE_PROJECT_FAILURE = '[FAILURE] Delete Project request failed';

export function deleteProject(pid) {
  return dispatch => {
    dispatch({
      type: DELETE_PROJECT_REQUEST,
      pid,
    });
    return http.delete(`/projects/${pid}`)
      .then(
        response => {
          dispatch(push('/project'));
          dispatch({
            type: DELETE_PROJECT_SUCCESS,
            data: response.data,
          });
        },
        fail(dispatch, DELETE_PROJECT_FAILURE)
      );
  };
}

export const ADD_TASK_REQUEST = '[REQUEST] Add Task to Project';
export const ADD_TASK_SUCCESS = '[SUCCESS] Add Task to Project received';
export const ADD_TASK_FAILURE = '[FAILURE] Add Task to Project request failed';

export function addTaskToProject(pid, descr, complete) {
  return dispatch => {
    dispatch({
      type: ADD_TASK_REQUEST,
      pid,
      descr,
      complete,
    });
    return http.post(`/projects/${pid}`, { descr })
      .then(
        response => {
          dispatch({
            type: ADD_TASK_SUCCESS,
            data: { descr, complete, pid, tid: String(response.data.tid) },
          });
        },
        fail(dispatch, ADD_TASK_FAILURE)
      );
  };
}

export const UPDATE_TASK_REQUEST = '[REQUEST] Update Task in Project';
export const UPDATE_TASK_SUCCESS = '[SUCCESS] Update Task in Project received';
export const UPDATE_TASK_FAILURE = '[FAILURE] Update Task in Project request failed';

export function updateTask(pid, tid, descr, complete) {
  return dispatch => {
    dispatch({
      type: UPDATE_TASK_REQUEST,
      pid,
      tid,
      descr,
      complete,
    });
    return http.put(`/projects/${pid}/${tid}`, { descr, complete })
      .then(
        response => {
          dispatch({
            type: UPDATE_TASK_SUCCESS,
            data: Object.assign({ descr, complete }, response.data),
          });
        },
        fail(dispatch, UPDATE_TASK_FAILURE)
      );
  };
}

export const DELETE_TASK_REQUEST = '[REQUEST] Delete Task in Project';
export const DELETE_TASK_SUCCESS = '[SUCCESS] Delete Task in Project received';
export const DELETE_TASK_FAILURE = '[FAILURE] Delete Task in Project request failed';

export function deleteTask(pid, tid) {
  return dispatch => {
    dispatch({
      type: DELETE_TASK_REQUEST,
      pid,
      tid,
    });
    return http.delete(`/projects/${pid}/${tid}`)
      .then(
        response => {
          dispatch({
            type: DELETE_TASK_SUCCESS,
            data: response.data,
          });
        },
        fail(dispatch, DELETE_TASK_FAILURE)
      );
  };
}
