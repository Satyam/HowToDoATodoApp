import React from 'react';
import { FormattedMessage } from 'react-intl';

const NotFound = props => (
  <div>
    <h1><FormattedMessage
      id="notFound.notFound"
      defaultMessage="Not found"
      description="Heading for page not found error"
    /></h1>
    <p><FormattedMessage
      id="notFound.path"
      defaultMessage="Path"
      description="Path to page not found error"
    />: <code>{props.location.pathname}</code></p>
  </div>
);

NotFound.propTypes = {
  location: React.PropTypes.shape({
    pathname: React.PropTypes.string,
  }),
};

export default NotFound;
