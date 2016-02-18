import React from 'react';
const data = require('./data.js');

const Task = ({ descr, complete, tid, onClick }) => {
  const handler = (typeof onClick === 'function') && (ev => {
    if (ev.button || ev.shiftKey || ev.altKey || ev.metaKey || ev.ctrlKey) return;
    /* See: https://facebook.github.io/react/docs/forms.html#potential-issues-with-checkboxes-and-radio-buttons
    */
    // ev.preventDefault();
    onClick({ tid });
  });

  return (
    <li onClick={handler}>
      <input type="checkbox" readOnly checked={complete} /> &nbsp; {descr}
    </li>
  );
};

Task.propTypes = {
  complete: React.PropTypes.bool,
  descr: React.PropTypes.string,
  tid: React.PropTypes.string,
  onClick: React.PropTypes.func,
};

class TaskList extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.tasks;
    this._handler = this.handler.bind(this);
  }
  handler({ tid }) {
    const task = this.state[tid];
    this.setState({ [tid]: Object.assign(task, { complete: !task.complete }) });
  }
  render() {
    const tasks = this.state;
    return (
      <ul className="task-list">{
        Object.keys(tasks).map(tid => (
          <Task key={tid}
            descr={tasks[tid].descr}
            complete={tasks[tid].complete}
            tid={tid}
            onClick={this._handler}
          />
        ))
      }</ul>
    );
  }
}

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
