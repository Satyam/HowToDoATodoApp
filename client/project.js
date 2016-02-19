import React from 'react';
const data = require('./data.js');

import TaskList from './taskList.js';

const Project = ({ params: { pid } }) => {
  const prj = data[pid];
  return prj
    ? (<div className="project">
        <h1>{prj.name}</h1>
        <p>{prj.descr}</p>
        <TaskList tasks={prj.tasks} />
      </div>)
    : (<p>Project {pid} not found</p>)
    ;
};

Project.propTypes = {
  params: React.PropTypes.shape({
    pid: React.PropTypes.string.isRequired,
  }),
};

export default Project;
