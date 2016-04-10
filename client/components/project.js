import React from 'react';
import { Link } from 'react-router';
import isPlainClick from '../utils/isPlainClick.js';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import TaskList from '../components/taskList.js';

const messages = defineMessages({
  areYouSure: {
    id: 'project.areYouSure',
    defaultMessage: 'Delete:\n{name}\nAre you sure?',
    description: 'Message in popup to ask for confirmation of project deletion',
  },
});

export const Project = ({ pid, project, onDeleteClick, intl }) => {
  const onDeleteButtonHandler = ev => {
    if (
      isPlainClick(ev) &&
      window.confirm( // eslint-disable-line no-alert
        intl.formatMessage(messages.areYouSure, project)
      )
    ) {
      onDeleteClick();
    }
  };
  return (
    project
    ? (<div className="project">
        <div className="row">
          <div className="col-md-9">
            <h1>{project.name}</h1>
            <p style={ { whiteSpace: 'pre-wrap' } }>{project.descr}</p>
          </div>
          <div className="col-md-3">
            <Link className="btn btn-default" to={`/project/editProject/${pid}`}>
              <FormattedMessage
                id="project.editProject"
                defaultMessage="Edit Project"
                description="Label for button to edit a project"
              />
            </Link>
            <button className="btn btn-warning" onClick={onDeleteButtonHandler}>
              <FormattedMessage
                id="project.deleteProject"
                defaultMessage="Delete Project"
                description="Label for button to delete a project"
              />
            </button>
          </div>
        </div>
        <TaskList pid={pid} />
      </div>)
    : (<p>
      <FormattedMessage
        id="project.projectNotFound"
        defaultMessage="Project {pid} not found"
        description="Warning when the project requested is not found"
        values={{ pid }}
      />
      </p>
    )
  );
};

Project.propTypes = {
  pid: React.PropTypes.string.isRequired,
  project: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    descr: React.PropTypes.string,
  }),
  onDeleteClick: React.PropTypes.func,
  intl: intlShape,
};

import { connect } from 'react-redux';

export const mapStateToProps = (state, props) => {
  const pid = props.params.pid;
  return {
    project: state.projects && state.projects[pid],
    pid,
  };
};

import { deleteProject } from '../actions';

export const mapDispatchToProps = (dispatch, props) => ({
  onDeleteClick: () => dispatch(deleteProject(props.params.pid)),
});

import asyncDispatcher from '../utils/asyncDispatcher.js';
import { getProjectById } from '../actions';

export const dispatchAsync = (dispatch, nextProps, currentProps, state) => {
  const pid = nextProps.params.pid;
  const prj = pid && state.projects && state.projects[pid];
  if (!prj || !prj.tasks) {
    return dispatch(getProjectById(pid));
  }
  return undefined;
};

export default asyncDispatcher(dispatchAsync)(connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Project)));
