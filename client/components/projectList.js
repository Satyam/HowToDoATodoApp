import React from 'react';
import { Link } from 'react-router';
import map from 'lodash/map';
import isEmpty from 'lodash/isEmpty';

const PrjItem = ({ pid, name, active }) => (
  <li className={active ? 'selected' : ''}>
    {
      active
      ? name
      : (<Link to={`/project/${pid}`}>
          {name}
        </Link>)
    }
  </li>
);

PrjItem.propTypes = {
  pid: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  active: React.PropTypes.bool.isRequired,
};

function ProjectList({ children, projects, activePid, newProject }) {
  return (
    <div className="project-list">
      <h1>Projects:</h1>
      <div className="row">
        <div className="col-md-9">
          <ul>{
            map(projects, (prj, pid) =>
              (<PrjItem key={pid}
                active={activePid === pid}
                pid={pid}
                name={prj.name}
              />)
            )
          }</ul>
        </div>
        <div className="col-md-3">
          {newProject
            ? (<button className="btn btn-default" disabled="disabled">Add Project</button>)
            : (<Link className="btn btn-default" to="/project/newProject">Add Project</Link>)
          }
        </div>
      </div>
      {children}
    </div>
  );
}

ProjectList.propTypes = {
  children: React.PropTypes.node,
  projects: React.PropTypes.object,
  activePid: React.PropTypes.string,
  newProject: React.PropTypes.bool,
};

import { connect } from 'react-redux';

const mapStateToProps = (state, props) => ({
  projects: state.projects,
  activePid: props.params.pid,
  newProject: /\/newProject$/.test(props.location.pathname),
});

import asyncDispatcher from '../utils/asyncDispatcher.js';
import { getAllProjects } from '../actions';

const dispatchAsync = (dispatch, nextProps, currentProps, state) => {
  if (isEmpty(state.projects)) {
    return dispatch(getAllProjects());
  }
  return undefined;
};

export default asyncDispatcher(dispatchAsync, connect(
  mapStateToProps
)(ProjectList));
