import React from 'react';
import store from '../store.js';

import TaskList from './taskList.js';

const Project = ({ params: { pid } }) => {
  const prj = store.getState().projects[pid];
  return prj
    ? (<div className="project">
        <h1>{prj.name}</h1>
        <p>{prj.descr}</p>
        <TaskList pid={pid}/>
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
