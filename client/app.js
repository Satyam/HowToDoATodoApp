import React from 'react';
import { Link } from 'react-router';

const App = props => (
  <div className="app">
    <p><Link to="/project">Projects</Link></p>
    <hr/>
    {props.children}
  </div>
);

App.propTypes = {
  children: React.PropTypes.node,
};

export default App;
