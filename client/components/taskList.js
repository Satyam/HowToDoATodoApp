import React from 'react';
import map from 'lodash/map';

const Task = ({ descr, complete, tid, onTaskClick }) => {
  const onTaskClickHandler = (typeof onTaskClick === 'function') && (ev => {
    if (ev.button || ev.shiftKey || ev.altKey || ev.metaKey || ev.ctrlKey) return;
    /* See: https://facebook.github.io/react/docs/forms.html#potential-issues-with-checkboxes-and-radio-buttons
    */
    // ev.preventDefault();
    onTaskClick({ tid });
  });
  return (
    <li onClick={onTaskClickHandler}>
      <input type="checkbox" readOnly checked={complete} /> &nbsp; {descr}
    </li>
  );
};

Task.propTypes = {
  complete: React.PropTypes.bool,
  descr: React.PropTypes.string,
  tid: React.PropTypes.string,
  onTaskClick: React.PropTypes.func,
};

function TaskList({ tasks, pid, onTaskItemClick }) {
  const onTaskItemClickHandler = ({ tid }) => {
    onTaskItemClick({ pid, tid });
  };
  return (
    <ul className="task-list">{
      map(tasks, (task, tid) => (
        <Task key={tid}
          descr={task.descr}
          complete={task.complete}
          tid={tid}
          onTaskClick={onTaskItemClickHandler}
        />
      ))
    }</ul>
  );
}

TaskList.propTypes = {
  pid: React.PropTypes.string.isRequired,
  tasks: React.PropTypes.shape({
    descr: React.PropTypes.string,
    complete: React.PropTypes.bool,
  }),
  onTaskItemClick: React.PropTypes.func,
};

import { connect } from 'react-redux';

const mapStateToProps = (state, props) => ({
  tasks: state.projects[props.pid].tasks,
});

import { toggleCompleted } from '../actions';

const mapDispatchToProps = (dispatch) => ({
  onTaskItemClick: ({ pid, tid }) => dispatch(toggleCompleted(pid, tid)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  {
    pure: false,
  }
)(TaskList);
