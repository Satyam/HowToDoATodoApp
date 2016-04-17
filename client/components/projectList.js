import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import map from 'lodash/map';
import isEmpty from 'lodash/isEmpty';
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
  pid: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
};

export class ProjectList extends Component {
  componentDidMount() {
    if (isEmpty(this.props.projects)) {
      this.props.loadProjectList();
    }
  }
  render() {
    const p = this.props;
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
              map(p.projects, (prj, pid) =>
                (<PrjItem key={pid}
                  active={p.activePid === pid}
                  pid={pid}
                  name={prj.name}
                />)
              )
            }</ul>
          </div>
          <div className="col-md-3">
            {p.newProject
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
        {p.children}
      </div>
    );
  }
}

ProjectList.propTypes = {
  children: PropTypes.node,
  projects: PropTypes.object,
  activePid: PropTypes.string,
  newProject: PropTypes.bool,
  loadProjectList: PropTypes.func,
};

import { getAllProjects } from 'client/store/actions';

ProjectList.serverInit = (dispatch) => dispatch(getAllProjects());

export const mapStateToProps = (state, props) => ({
  projects: state.projects,
  activePid: props.params.pid,
  newProject: /\/newProject$/.test(props.location.pathname),
});

export const mapDispatchToProps = (dispatch) => ({
  loadProjectList: () => dispatch(getAllProjects()),
});

import { connect } from 'react-redux';

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectList);
