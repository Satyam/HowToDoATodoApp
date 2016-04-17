import React, { Component, PropTypes } from 'react';
import bindHandlers from 'client/utils/bindHandlers.js';
import isPlainClick from 'client/utils/isPlainClick.js';
import { FormattedMessage } from 'react-intl';

export class EditProject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.name,
      descr: props.descr,
    };
    bindHandlers(this);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      name: nextProps.name,
      descr: nextProps.descr,
    });
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
            onClick={this.props.cancelButton}
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
  name: PropTypes.string,
  descr: PropTypes.string,
  onSubmit: PropTypes.func,
  cancelButton: PropTypes.func,
};

import { getProjectById, addProject, updateProject, push, replace } from 'client/actions';

EditProject.serverInit = (dispatch, { params }) => dispatch(getProjectById(params.pid));

export const mapStateToProps = (state, { params }) => {
  const pid = params.pid;
  const prj = pid && state.projects && state.projects[pid];
  return prj || {
    name: '',
    descr: '',
  };
};

export const mapDispatchToProps = (dispatch, { params }) => ({
  onSubmit: (name, descr) => {
    const pid = params.pid;
    if (pid) {
      return dispatch(updateProject(params.pid, name, descr))
        .then(() => dispatch(push(`/project/${pid}`)));
    }
    return dispatch(addProject(name, descr))
      .then(response => dispatch(push(`/project/${response.data.pid}`)));
  },
  cancelButton: ev => {
    if (isPlainClick(ev)) dispatch(replace(`/project/${params.pid}`));
  },
});

import { connect } from 'react-redux';

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  (stateProps, dispatchProps) => Object.assign({}, stateProps, dispatchProps)
)(EditProject);
