import React from 'react';
import isPlainClick from '../utils/isPlainClick.js';

const Task = ({ descr, complete, pid, tid, onTaskClick }) => {
  const onTaskClickHandler = (typeof onTaskClick === 'function') && (ev => {
    if (isPlainClick(ev)) onTaskClick(pid, tid, descr, !complete);
  });
  return (
    <div className="row task">
      <span
        className={`${complete ? 'completed' : 'pending'} col-xs-9`}
        onClick={onTaskClickHandler}
      >
        {descr}
      </span>
      <span className="col-xs-3">
        <span className="glyphicon glyphicon-pencil text-primary" aria-hidden="true"></span>
        <span className="glyphicon glyphicon-trash text-danger" aria-hidden="true"></span>
      </span>
    </div>
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

import { updateTask } from '../actions';

const mapDispatchToProps = (dispatch) => ({
  onTaskClick: (pid, tid, descr, complete) => dispatch(updateTask(pid, tid, descr, complete)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Task);
