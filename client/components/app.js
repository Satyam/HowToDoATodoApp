import React from 'react';
import { Link } from 'react-router';
import isPlainClick from '../utils/isPlainClick.js';
import Locale from './locale.js';
import { FormattedMessage } from 'react-intl';

export const App = ({ children, pathname, busy, errors, onCloseErrors }) => (
  <div className="app">
    <div className="row">
      <div className="col-xs-10">
        <ul className="nav nav-tabs">
          {
            /^\/project/.test(pathname)
            ? (<li className="active"><a href="#">
              <FormattedMessage
                id="app.projects"
                defaultMessage="Projects"
                description="Heading for the list of projects"
              />
              </a></li>)
            : (<li><Link to="/project">
            <FormattedMessage
              id="app.projects"
              defaultMessage="Projects"
              description="Heading for the list of projects"
            />
            </Link></li>)
          }
        </ul>
      </div>
      <div className="col-xs-2">
        <Locale />
      </div>
    </div>

    <p className="loading" style={ { display: busy ? 'block' : 'none' } }>
      <FormattedMessage
        id="app.busy"
        defaultMessage="Loading"
        description="Popup telling the user the page is busy loading something"
      />
    </p>
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

export const mapStateToProps = (state, props) => ({
  pathname: props.location.pathname,
  busy: !!state.requests.pending,
  errors: state.requests.errors,
});

export const mapDispatchToProps = dispatch => ({
  onCloseErrors: ev => isPlainClick(ev) && dispatch(clearErrors()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
