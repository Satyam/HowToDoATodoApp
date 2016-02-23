import React from 'react';

const NotFound = props => (
  <div>
    <h1>Not found</h1>
    <p>Path: <code>{props.location.pathname}</code></p>
  </div>
);

NotFound.propTypes = {
  location: React.PropTypes.shape({
    pathname: React.PropTypes.string,
  }),
};

export default NotFound;
