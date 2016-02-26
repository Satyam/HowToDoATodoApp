import React from 'react';

const Task = ({ descr, complete, pid, tid, onTaskClick }) => {
  const onTaskClickHandler = (typeof onTaskClick === 'function') && (ev => {
    if (ev.button || ev.shiftKey || ev.altKey || ev.metaKey || ev.ctrlKey) return;
    /* See: https://facebook.github.io/react/docs/forms.html#potential-issues-with-checkboxes-and-radio-buttons
    */
    // ev.preventDefault();
    onTaskClick({ pid, tid });
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
  pid: React.PropTypes.string,
  tid: React.PropTypes.string,
  onTaskClick: React.PropTypes.func,
};

import { connect } from 'react-redux';

const mapStateToProps = (state, { pid, tid }) => Object.assign({}, state.projects[pid].tasks[tid]);

import { toggleCompleted } from '../actions';

const mapDispatchToProps = (dispatch) => ({
  onTaskClick: ({ pid, tid }) => dispatch(toggleCompleted(pid, tid)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Task);
