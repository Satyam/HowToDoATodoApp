import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Task from './task.js';
import EditTask from './editTask.js';

export function TaskList({ tasks, pid, editTid }) {
  return (tasks
    ? (<div className="task-list">{
      Object.keys(tasks).map((tid) => (
          tid === editTid
          ? <EditTask key={tid}
            pid={pid}
            tid={tid}
          />
          : <Task key={tid}
            pid={pid}
            tid={tid}
          />
        ))
      }
      {editTid ? null : <EditTask pid={pid} />}
    </div>)
    : (<p><FormattedMessage
      id="taskList.noTasks"
      defaultMessage="No tasks found for project {pid}"
      description="Warning that project has no tasks"
      values={{ pid }}
    /></p>)

  );
}

TaskList.propTypes = {
  pid: PropTypes.string.isRequired,
  editTid: PropTypes.string,
  tasks: PropTypes.object,
};

import { connect } from 'react-redux';

export const mapStateToProps = (state, { pid }) => ({
  tasks: state.projects[pid].tasks,
  editTid: state.misc.editTid,
  // pid just passes through
});

export default connect(
  mapStateToProps
)(TaskList);
