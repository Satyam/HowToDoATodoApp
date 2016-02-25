import React from 'react';

import TaskList from '../components/taskList.js';

const Project = ({ pid, project }) => (
  project
  ? (<div className="project">
      <h1>{project.name}</h1>
      <p>{project.descr}</p>
      <TaskList pid={pid}/>
    </div>)
  : (<p>Project {pid} not found</p>)
);

Project.propTypes = {
  pid: React.PropTypes.string.isRequired,
  project: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    descr: React.PropTypes.string,
  }),
};

import { connect } from 'react-redux';

const mapStateToProps = (state, props) => {
  const pid = props.params.pid;
  return {
    project: state.projects[pid],
    pid,
  };
};

export default connect(
  mapStateToProps
)(Project);
