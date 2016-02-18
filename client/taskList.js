import React from 'react';

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
    this._handler = this.handler.bind(this);
  }
  handler({ tid }) {
    const task = this.props.tasks[tid];
    task.complete = !task.complete;
    this.forceUpdate();
  }
  render() {
    const tasks = this.props.tasks;
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

export default TaskList;
