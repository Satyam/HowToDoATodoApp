import React from 'react';
import { Link } from 'react-router';

const App = ({ children, pathname, busy, errors }) => (
  <div className="app">
    <p>{
        /^\/project/.test(pathname)
        ? 'Projects'
        : (<Link to="/project">Projects</Link>)
    }</p>
    <p className="loading" style={ { display: busy ? 'block' : 'none' } }>Busy</p>
    <pre className="errors" style={ { display: errors.length ? 'block' : 'none' } }>
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
};

import { connect } from 'react-redux';

const mapStateToProps = (state, props) => ({
  pathname: props.location.pathname,
  busy: !!state.requests.pending,
  errors: state.requests.errors,
});

export default connect(
  mapStateToProps
)(App);
