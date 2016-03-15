import React from 'react';
import { Link } from 'react-router';
import isPlainClick from '../utils/isPlainClick.js';

const App = ({ children, pathname, busy, errors, onCloseErrors }) => (
  <div className="app">
    <ul className="nav nav-tabs">
      {
        /^\/project/.test(pathname)
        ? (<li className="active"><a href="#">Projects</a></li>)
        : (<li><Link to="/project">Projects</Link></li>)
      }
    </ul>

    <p></p>
    <p className="loading" style={ { display: busy ? 'block' : 'none' } }>Busy</p>
    <pre
      className="alert alert-warning alert-dismissible"
      style={ { display: errors.length ? 'block' : 'none' } }
    >
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
  onCloseErrors: ev => isPlainClick(ev) && dispatch(clearErrors()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
