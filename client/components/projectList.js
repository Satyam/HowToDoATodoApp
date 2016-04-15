import React from 'react';
import { Link } from 'react-router';
import map from 'lodash/map';
import { FormattedMessage } from 'react-intl';

export const PrjItem = ({ pid, name, active }) => (
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

export function ProjectList({ children, projects, activePid, newProject }) {
  return (
    <div className="project-list">
      <h1><FormattedMessage
        id="projectList.projects"
        defaultMessage="Projects:"
        description="Heading for list of projects"
      /></h1>
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
            ? (<button className="btn btn-default" disabled="disabled">
                <FormattedMessage
                  id="projectList.addProject"
                  defaultMessage="Add Project:"
                  description="Label of button to add a project"
                />
              </button>)
            : (<Link className="btn btn-default" to="/project/newProject">
                <FormattedMessage
                  id="projectList.addProject"
                  defaultMessage="Add Project:"
                  description="Label of button to add a project"
                />
              </Link>)
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

import { getAllProjects } from '../actions';

ProjectList.serverInit = (dispatch) => dispatch(getAllProjects());

export const mapStateToProps = (state, props) => ({
  projects: state.projects,
  activePid: props.params.pid,
  newProject: /\/newProject$/.test(props.location.pathname),
});

import { connect } from 'react-redux';

export default connect(
  mapStateToProps
)(ProjectList);
