import React from 'react';
const data = require('./data.js');

const Task = ({ task }) => (
  <li>
    <input type="checkbox" defaultChecked={task.complete} /> &nbsp; {task.descr}
  </li>
);

Task.propTypes = {
  task: React.PropTypes.shape({
    complete: React.PropTypes.bool,
    descr: React.PropTypes.string,
  }),
};

const TaskList = ({ tasks }) => (
  <ul className="task-list">{
    Object.keys(tasks).map(tid => (
      <Task key={tid} task={tasks[tid]} />
    ))
  }</ul>
);

TaskList.propTypes = {
  tasks: React.PropTypes.object,
};

const Project = ({ params: { pid } }) => {
  const prj = data[pid];
  return (<div className="project">
    <h1>{prj.name}</h1>
    <p>{prj.descr}</p>
    <TaskList tasks={prj.tasks} />
  </div>);
};

Project.propTypes = {
  params: React.PropTypes.shape({
    pid: React.PropTypes.string.isRequired,
  }),
};

export default Project;
