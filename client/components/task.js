import React from 'react';

const Task = ({ descr, complete, pid, tid, onTaskClick }) => {
  const onTaskClickHandler = (typeof onTaskClick === 'function') && (ev => {
    if (ev.button || ev.shiftKey || ev.altKey || ev.metaKey || ev.ctrlKey) return;
    ev.preventDefault();
    onTaskClick({ pid, tid });
  });
  return (
    <li
      className={complete ? 'completed' : 'pending'}
      onClick={onTaskClickHandler}
    >
      {descr}
    </li>
  );
};

Task.propTypes = {
  complete: React.PropTypes.bool,
  descr: React.PropTypes.string,
  pid: React.PropTypes.string,
  tid: React.PropTypes.string,
  onTaskClick: React.PropTypes.func,
};

import { connect } from 'react-redux';

const mapStateToProps = (state, { pid, tid }) => state.projects[pid].tasks[tid];

import { toggleCompleted } from '../actions';

const mapDispatchToProps = (dispatch) => ({
  onTaskClick: ({ pid, tid }) => dispatch(toggleCompleted(pid, tid)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Task);
