import React from 'react';
const data = require('./data.js');

const Task = ({ descr, complete, tid, onClick }) => {
  const handler = (typeof onClick === 'function') && (ev => {
    if (ev.button || ev.shiftKey || ev.altKey || ev.metaKey || ev.ctrlKey) return;
    ev.preventDefault();
    onClick({ tid });
  });

  return (
    <li onClick={handler}>
      <input type="checkbox" defaultChecked={complete} /> &nbsp; {descr}
    </li>
  );
};

Task.propTypes = {
  complete: React.PropTypes.bool,
  descr: React.PropTypes.string,
  tid: React.PropTypes.string,
  onClick: React.PropTypes.func,
};

const TaskList = ({ tasks }) => {
  const handler = ev => console.log('click', ev);
  return (
    <ul className="task-list">{
      Object.keys(tasks).map(tid => (
        <Task key={tid}
          descr={tasks[tid].descr}
          complete={tasks[tid].complete}
          tid={tid}
          onClick={handler}
        />
      ))
    }</ul>
  );
};

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
