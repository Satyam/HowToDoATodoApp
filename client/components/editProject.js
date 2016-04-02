import React from 'react';
import bindHandlers from '../utils/bindHandlers.js';
import isPlainClick from '../utils/isPlainClick.js';
import { FormattedMessage } from 'react-intl';

class EditProject extends React.Component {
  constructor(props) {
    super(props);
    this.state = props;
    bindHandlers(this);
  }
  componentWillReceiveProps(nextProps) {
    this.setState(nextProps);
  }
  onChangeHandler(ev) {
    const target = ev.target;
    this.setState({ [target.name]: target.value });
  }
  onSubmitHandler(ev) {
    ev.preventDefault();
    this.props.onSubmit(this.state.name, this.state.descr);
  }
  render() {
    return (
      <div className="edit-project">
        <form onSubmit={this.onSubmitHandler}>
          <div className="form-group">
            <label htmlFor="name">
              <FormattedMessage
                id="editProject.name"
                defaultMessage="Name"
                description="Label for field asking the name of the project"
              />
            </label>
            <input
              className="form-control"
              name="name"
              onChange={this.onChangeHandler}
              value={this.state.name}
            />
          </div>
          <div className="form-group">
            <label htmlFor="descr">
              <FormattedMessage
                id="editProject.descr"
                defaultMessage="Description"
                description="Label for the field asking for a description of the project"
              />
            </label>
            <textarea
              className="form-control"
              name="descr"
              onChange={this.onChangeHandler}
              value={this.state.descr}
            />
          </div>
          <button className="btn btn-primary" type="submit">
            <FormattedMessage
              id="editProject.labelOk"
              defaultMessage="Ok"
              description="Label for Ok button"
            />
          </button>
          <button
            className="btn btn-default"
            type="button"
            onClick={this.state.cancelButton}
          >
          <FormattedMessage
            id="editProject.labelCancel"
            defaultMessage="Cancel"
            description="Label for Cancel button"
          />

          </button>
        </form>
      </div>
    );
  }
}

EditProject.propTypes = {
  name: React.PropTypes.string,
  descr: React.PropTypes.string,
  onSubmit: React.PropTypes.func,
  cancelButton: React.PropTypes.func,
};

const mapStateToProps = (state, props) => {
  const pid = props.params.pid;
  const prj = pid && state.projects && state.projects[pid];
  return prj || {
    name: '',
    descr: '',
  };
};

import { addProject, updateProject, push, goBack } from '../actions';

const mapDispatchToProps = (dispatch, props) => ({
  onSubmit: (name, descr) => {
    const pid = props.params.pid;
    if (pid) {
      return dispatch(updateProject(props.params.pid, name, descr))
        .then(() => dispatch(push(`/project/${pid}`)));
    }
    return dispatch(addProject(name, descr))
      .then(response => dispatch(push(`/project/${response.data.pid}`)));
  },
  cancelButton: ev => {
    if (isPlainClick(ev)) dispatch(goBack());
  },
});

import asyncDispatcher from '../utils/asyncDispatcher.js';
import { getProjectById } from '../actions';

const dispatchAsync = (dispatch, nextProps, currentProps, state) => {
  const pid = nextProps.params.pid;
  const prj = pid && state.projects && state.projects[pid];
  if (pid && !prj) {
    return dispatch(getProjectById(pid));
  }
  return undefined;
};

import { connect } from 'react-redux';

export default asyncDispatcher(dispatchAsync)(connect(
  mapStateToProps,
  mapDispatchToProps,
  (stateProps, dispatchProps) => Object.assign({}, stateProps, dispatchProps)
)(EditProject));
