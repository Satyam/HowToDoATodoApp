import React from 'react';
import { Link } from 'react-router';
const data = require('./data.js');

const PrjItem = ({ pid, name }) => (
  <li>
    <Link to={`/project/${pid}`}>
      {name}
    </Link>
  </li>
);

PrjItem.propTypes = {
  pid: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
};

const ProjectList = ({ children }) => (
  <div className="project-list">
    <h1>Projects:</h1>
    <ul>{
      Object.keys(data).map(pid =>
        (<PrjItem key={pid} pid={pid} name={data[pid].name}/>)
      )
    }</ul>
  <hr/>
  {children}
  </div>
);

ProjectList.propTypes = {
  children: React.PropTypes.node,
};

export default ProjectList;
