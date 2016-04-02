import React from 'react';
import isPlainClick from '../utils/isPlainClick.js';
import { injectIntl, intlShape, defineMessages } from 'react-intl';

const messages = defineMessages({
  areYouSure: {
    id: 'task.areYouSure',
    defaultMessage: 'Delete: \n{descr}\nAre you sure?',
    description: 'Message in popup to ask for confirmation of action',
  },
});

const Task = ({ pid, tid, descr, complete, onTaskClick, onTaskEdit, onTaskDelete, intl }) => {
  const onTaskClickHandler = ev => {
    if (isPlainClick(ev)) onTaskClick(pid, tid, descr, !complete);
  };
  const onTaskEditHandler = ev => {
    if (isPlainClick(ev)) onTaskEdit(pid, tid);
  };
  const onTaskDeleteHandler = ev => {
    if (
      isPlainClick(ev) &&
      window.confirm(  // eslint-disable-line no-alert
        intl.formatMessage(messages.areYouSure, { descr })
      )
    ) {
      onTaskDelete(pid, tid);
    }
  };
  return (
    <div className="row task">
      <span
        className={`${complete ? 'completed' : 'pending'} col-xs-9`}
        onClick={onTaskClickHandler}
      >
        {descr}
      </span>
      <span className="col-xs-3">
        <span
          className="glyphicon glyphicon-pencil text-primary"
          onClick={onTaskEditHandler}
          aria-hidden="true"
        ></span>
        <span
          className="glyphicon glyphicon-trash text-danger"
          onClick={onTaskDeleteHandler}
          aria-hidden="true"
        ></span>
      </span>
    </div>
  );
};

Task.propTypes = {
  pid: React.PropTypes.string,
  tid: React.PropTypes.string,
  descr: React.PropTypes.string,
  complete: React.PropTypes.bool,
  onTaskClick: React.PropTypes.func,
  onTaskEdit: React.PropTypes.func,
  onTaskDelete: React.PropTypes.func,
  intl: intlShape,
};

import { connect } from 'react-redux';

const mapStateToProps = (state, { pid, tid }) => state.projects[pid].tasks[tid];

import { updateTask, setEditTid, deleteTask } from '../actions';

const mapDispatchToProps = (dispatch) => ({
  onTaskClick: (pid, tid, descr, complete) => dispatch(updateTask(pid, tid, descr, complete)),
  onTaskEdit: (pid, tid) => dispatch(setEditTid(tid)),
  onTaskDelete: (pid, tid) => dispatch(deleteTask(pid, tid)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Task));
