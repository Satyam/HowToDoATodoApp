import React from 'react';
const map = require('lodash/map');
import { toggleCompleted } from '../actions';
import store from '../store.js';

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
  componentDidMount() {
    this._unsubscriber = store.subscribe(this.forceUpdate.bind(this));
  }
  componentWillUnmount() {
    this._unsubscriber();
  }
  handler({ tid }) {
    store.dispatch(toggleCompleted(this.props.pid, tid));
  }
  render() {
    const projects = store.getState().projects;
    const tasks = projects[this.props.pid].tasks;
    return (
      <ul className="task-list">{
        map(tasks, (task, tid) => (
          <Task key={tid}
            descr={task.descr}
            complete={task.complete}
            tid={tid}
            onClick={this._handler}
          />
        ))
      }</ul>
    );
  }
}

TaskList.propTypes = {
  pid: React.PropTypes.string.isRequired,
};

export default TaskList;
