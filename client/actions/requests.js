import axios from 'axios';

const http = axios.create({
  baseURL: `${window.location.origin}/data/v1`,
  responseType: 'json',
});

export const ALL_PROJECTS_REQUEST = '[REQUEST] Project list';
export const ALL_PROJECTS_SUCCESS = '[SUCCESS] Project list received';
export const ALL_PROJECTS_FAILURE = '[FAILURE] Project list request failed';

export function getAllProjects() {
  return dispatch => {
    dispatch({
      type: ALL_PROJECTS_REQUEST,
    });
    return http.get('/projects')
      .then(
        response => dispatch({
          type: ALL_PROJECTS_SUCCESS,
          data: response.data,
        }),
        response => dispatch({
          type: ALL_PROJECTS_FAILURE,
          status: response.status,
          msg: response.statusText,
          url: response.config.url.replace(response.config.baseURL, ''),
        })
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
        response => dispatch({
          type: PROJECT_BY_ID_FAILURE,
          status: response.status,
          msg: response.statusText,
          url: response.config.url.replace(response.config.baseURL, ''),
        })
      );
  };
}
/*
export function getTaskByTid(pid, tid) {
  return {
    type: _REQUEST,
    pid,
    tid,
  };
}
export function addProject() {
  return {
    type: _REQUEST,
  };
}
export function addTaskToProject(pid) {
  return {
    type: _REQUEST,
    pid,
  };
}
export function updateProject(pid) {
  return {
    type: _REQUEST,
    pid,
  };
}
export function updateTask(pid, tid) {
  return {
    type: _REQUEST,
    pid,
    tid,
  };
}
export function deleteProject(pid) {
  return {
    type: _REQUEST,
    pid,
  };
}
export function deleteTask(pid, tid) {
  return {
    type: _REQUEST,
    pid,
    tid,
  };
}
*/
