import React from 'react';
import { Link } from 'react-router';
const data = require('./data.js');

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
  count: React.PropTypes.number.isRequired,
};

const ProjectList = ({ children, params: { pid: activePid } }) => (
  <div className="project-list">
    <h1>Projects:</h1>
    <ul>{
      Object.keys(data).map(pid =>
        (<PrjItem key={pid}
          active={activePid === pid}
          pid={pid}
          name={data[pid].name}
          pending={
            Object.keys(data[pid].tasks).reduce(
              (count, tid) => data[pid].tasks[tid].complete ? count : count + 1,
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
