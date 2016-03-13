import React from 'react';

import Task from './task.js';
import EditTask from './editTask.js';

function TaskList({ tasks, pid, editTid }) {
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
    : (<p>No tasks found for project {pid}</p>)

  );
}

TaskList.propTypes = {
  pid: React.PropTypes.string.isRequired,
  editTid: React.PropTypes.string,
  tasks: React.PropTypes.object,
};

import { connect } from 'react-redux';

const mapStateToProps = (state, { pid }) => ({
  tasks: state.projects[pid].tasks,
  editTid: state.misc.editTid,
  // pid just passes through
});

export default connect(
  mapStateToProps
)(TaskList);
