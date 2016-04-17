import React, { Component, PropTypes } from 'react';
import bindHandlers from 'client/utils/bindHandlers.js';
import { FormattedMessage } from 'react-intl';

export class EditTask extends Component {
  constructor(props) {
    super(props);
    this.state = props;
    bindHandlers(this);
  }
  onChangeHandler(ev) {
    this.setState({ descr: ev.target.value });
  }
  onSubmitHandler(ev) {
    ev.preventDefault();
    const st = this.state;
    st.onSubmit(st.pid, st.tid, st.descr, st.complete)
      .then(() => this.setState({ descr: '' }));
  }
  render() {
    return (
      <div className={
          this.state.tid
          ? 'edit-task'
          : 'add-task'
        }
      >
        <form className="row" onSubmit={this.onSubmitHandler}>
          <div className="col-xs-7">
            <div className="form-group">
              <input
                className="form-control"
                name="descr"
                onChange={this.onChangeHandler}
                value={this.state.descr}
              />
            </div>
          </div>
          <div className="col-xs-5">
            <button className="btn btn-primary" type="submit">{
                this.state.tid
                ? (<FormattedMessage
                  id="editTask.updateTask"
                  defaultMessage="Update"
                  description="Label for button to update a task"
                />)
                : (<span className="glyphicon glyphicon-plus" aria-hidden="true"></span>)
              }</button>
          </div>
        </form>
      </div>
    );
  }
}

EditTask.propTypes = {
  pid: PropTypes.string,
  tid: PropTypes.string,
  descr: PropTypes.string,
  complete: PropTypes.bool,
  onSubmit: PropTypes.func,
};

import { connect } from 'react-redux';

export const mapStateToProps = (state, { pid, tid }) => ({
  pid,
  tid,
  descr:
    tid
    ? state.projects[pid].tasks[tid].descr
    : '',
  complete:
    tid
    ? state.projects[pid].tasks[tid].complete
    : false,
});

import { updateTask, addTaskToProject, setEditTid } from 'client/store/actions';

export const mapDispatchToProps = (dispatch) => ({
  onSubmit: (pid, tid, descr, complete) => {
    if (tid) {
      return dispatch(updateTask(pid, tid, descr, complete))
        .then(dispatch(setEditTid(null)));
    }
    return dispatch(addTaskToProject(pid, descr, complete));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditTask);
