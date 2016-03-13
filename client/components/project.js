import React from 'react';
import { Link } from 'react-router';

import TaskList from '../components/taskList.js';

const Project = ({ pid, project, onDeleteClick }) => (
  project
  ? (<div className="project">
      <div className="row">
        <div className="col-md-9">
          <h1>{project.name}</h1>
          <p style={ { whiteSpace: 'pre-wrap' } }>{project.descr}</p>
        </div>
        <div className="col-md-3">
          <Link className="btn btn-default" to={`/project/editProject/${pid}`}>Edit Project</Link>
          <button className="btn btn-warning" onClick={onDeleteClick}>Delete Project</button>
        </div>
      </div>
      <TaskList pid={pid} />
    </div>)
  : (<p>Project {pid} not found</p>)
);

Project.propTypes = {
  pid: React.PropTypes.string.isRequired,
  project: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    descr: React.PropTypes.string,
  }),
};

import { connect } from 'react-redux';

const mapStateToProps = (state, props) => {
  const pid = props.params.pid;
  return {
    project: state.projects && state.projects[pid],
    pid,
  };
};

import { deleteProject } from '../actions';

const mapDispatchToProps = (dispatch, props) => ({
  onDeleteClick: () => {
    if (window.confirm('Are you sure?')) { // eslint-disable-line no-alert
      dispatch(deleteProject(props.params.pid));
    }
  },
});

import asyncDispatcher from '../utils/asyncDispatcher.js';
import { getProjectById } from '../actions';

const dispatchAsync = (dispatch, nextProps, currentProps, state) => {
  const pid = nextProps.params.pid;
  const prj = pid && state.projects && state.projects[pid];
  if (!prj || !prj.tasks) {
    dispatch(getProjectById(pid));
    return false;
  }
  return undefined;
};

export default asyncDispatcher(dispatchAsync, connect(
  mapStateToProps,
  mapDispatchToProps
)(Project));
