import React from 'react';
import { Link } from 'react-router';
import map from 'lodash/map';
import reduce from 'lodash/reduce';

const PrjItem = ({ pid, name, active, pending }) => (
  <li className={active ? 'selected' : ''}>
    {
      active
      ? name
      : (<Link to={`/project/${pid}`}>
          {name}
        </Link>)
    } [Pending: {pending}]
  </li>
);

PrjItem.propTypes = {
  pid: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  active: React.PropTypes.bool.isRequired,
  pending: React.PropTypes.number.isRequired,
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
            pending={
              reduce(prj.tasks,
                (count, task) => task.complete ? count : count + 1,
                0
              )
            }
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

export default connect(
  mapStateToProps
)(ProjectList);
