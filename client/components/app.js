import React from 'react';
import { Link } from 'react-router';

const App = ({ children, pathname, busy, errors, onCloseErrors }) => (
  <div className="app">
    <p>{
        /^\/project/.test(pathname)
        ? 'Projects'
        : (<Link className="btn btn-default" to="/project">Projects</Link>)
    }</p>
    <p className="loading" style={ { display: busy ? 'block' : 'none' } }>Busy</p>
    <pre className="errors" style={ { display: errors.length ? 'block' : 'none' } }>
      <button onClick={onCloseErrors} className="close pull-right">
        <span>&times;</span>
      </button>
      {errors.join('\n')}
    </pre>
    {children}
  </div>
);

App.propTypes = {
  children: React.PropTypes.node,
  pathname: React.PropTypes.string,
  busy: React.PropTypes.bool,
  errors: React.PropTypes.array,
  onCloseErrors: React.PropTypes.func,
};

import { connect } from 'react-redux';
import { clearErrors } from '../actions';

const mapStateToProps = (state, props) => ({
  pathname: props.location.pathname,
  busy: !!state.requests.pending,
  errors: state.requests.errors,
});

const mapDispatchToProps = dispatch => ({
  onCloseErrors: () => dispatch(clearErrors()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
