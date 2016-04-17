import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import isPlainClick from 'client/utils/isPlainClick.js';
import bindHandlers from 'client/utils/bindHandlers.js';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import TaskList from 'client/components/taskList.js';

const messages = defineMessages({
  areYouSure: {
    id: 'project.areYouSure',
    defaultMessage: 'Delete:\n{name}\nAre you sure?',
    description: 'Message in popup to ask for confirmation of project deletion',
  },
});

export class Project extends Component {
  constructor(props) {
    super(props);
    bindHandlers(this);
  }
  componentDidMount() {
    const p = this.props;
    const prj = p.project;
    if (!prj || !prj.tasks) p.loadProject(p.pid);
  }
  componentWillReceiveProps(newProps) {
    const prj = newProps.project;
    if (!prj || !prj.tasks) this.props.loadProject(newProps.pid);
  }
  onDeleteButtonHandler(ev) {
    const p = this.props;
    if (
      isPlainClick(ev) &&
      window.confirm( // eslint-disable-line no-alert
        p.intl.formatMessage(messages.areYouSure, p.project)
      )
    ) {
      p.onDeleteClick();
    }
  }
  render() {
    const p = this.props;
    return (
      p.project
      ? (<div className="project">
          <div className="row">
            <div className="col-md-9">
              <h1>{p.project.name}</h1>
              <p style={ { whiteSpace: 'pre-wrap' } }>{p.project.descr}</p>
            </div>
            <div className="col-md-3">
              <Link className="btn btn-default" to={`/project/editProject/${p.pid}`}>
                <FormattedMessage
                  id="project.editProject"
                  defaultMessage="Edit Project"
                  description="Label for button to edit a project"
                />
              </Link>
              <button className="btn btn-warning" onClick={this.onDeleteButtonHandler}>
                <FormattedMessage
                  id="project.deleteProject"
                  defaultMessage="Delete Project"
                  description="Label for button to delete a project"
                />
              </button>
            </div>
          </div>
          <TaskList pid={p.pid} />
        </div>)
      : (<p>
        <FormattedMessage
          id="project.projectNotFound"
          defaultMessage="Project {pid} not found"
          description="Warning when the project requested is not found"
          values={{ pid: p.pid }}
        />
        </p>
      )
    );
  }
}

Project.propTypes = {
  pid: PropTypes.string.isRequired,
  project: PropTypes.shape({
    name: PropTypes.string.isRequired,
    descr: PropTypes.string,
  }),
  onDeleteClick: PropTypes.func,
  intl: intlShape,
  loadProject: PropTypes.func,
};

import { getProjectById, deleteProject } from 'client/store/actions';

Project.serverInit = (dispatch, { params }) => dispatch(getProjectById(params.pid));

export const mapStateToProps = (state, props) => {
  const pid = props.params.pid;
  return {
    project: state.projects && state.projects[pid],
    pid,
  };
};

export const mapDispatchToProps = (dispatch, props) => ({
  onDeleteClick: () => dispatch(deleteProject(props.params.pid)),
  loadProject: pid => dispatch(getProjectById(pid)),
});

import { connect } from 'react-redux';

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Project));
