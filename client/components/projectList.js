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

function ProjectList({ children, projects, activePid }) {
  return (
    <div className="project-list">
      <h1>Projects:</h1>
      <ul>{
        map(projects, (prj, pid) =>
          (<PrjItem key={pid}
            active={activePid === pid}
            pid={pid}
            name={prj.name}
          />)
        )
      }</ul>
    {children}
    </div>
  );
}

ProjectList.propTypes = {
  children: React.PropTypes.node,
  projects: React.PropTypes.object,
  activePid: React.PropTypes.string,
};

import { connect } from 'react-redux';

const mapStateToProps = (state, props) => ({
  projects: state.projects,
  activePid: props.params.pid,
});

import asyncDispatcher from '../utils/asyncDispatcher.js';
import { getAllProjects } from '../actions';

const dispatchAsync = (dispatch, nextProps, currentProps, state) => {
  if (isEmpty(state.projects)) {
    dispatch(getAllProjects());
    return false;
  }
  return undefined;
};

export default asyncDispatcher(dispatchAsync, connect(
  mapStateToProps
)(ProjectList));
