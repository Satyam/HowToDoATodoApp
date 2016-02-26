import React from 'react';

import Task from './task.js';

function TaskList({ tasks, pid }) {
  return (
    <ul className="task-list">{
      Object.keys(tasks).map((tid) => (
        <Task key={tid}
          pid={pid}
          tid={tid}
        />
      ))
    }</ul>
  );
}

TaskList.propTypes = {
  pid: React.PropTypes.string.isRequired,
  tasks: React.PropTypes.object,
};

import { connect } from 'react-redux';

const mapStateToProps = (state, { pid }) => ({
  tasks: state.projects[pid].tasks,
  // pid just passes through
});

export default connect(
  mapStateToProps
)(TaskList);
