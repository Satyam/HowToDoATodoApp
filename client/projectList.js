import React from 'react';
import { Link } from 'react-router';
const data = require('./data.js');
const map = require('lodash/map');
const reduce = require('lodash/reduce');


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

const ProjectList = ({ children, params: { pid: activePid } }) => (
  <div className="project-list">
    <h1>Projects:</h1>
    <ul>{
      map(data, (prj, pid) =>
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
  <hr/>
  {children}
  </div>
);

ProjectList.propTypes = {
  children: React.PropTypes.node,
  params: React.PropTypes.shape({
    pid: React.PropTypes.string,
  }),
};

export default ProjectList;
