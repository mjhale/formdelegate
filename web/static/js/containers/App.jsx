import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Nav from './Nav';

const propTypes = {
  isAuthenticated: PropTypes.bool,
  children: PropTypes.node,
};

class AppContainer extends React.Component {
  render() {
    const { children, isAuthenticated } = this.props;

    return (
      <div className="home">
        <nav className="navigation">
          <Link to="/" className="logo">form delegate</Link>
          <Nav isAuthenticated={isAuthenticated} />
        </nav>
        <div className="content">
          {children}
        </div>
      </div>
    );
  }
}

AppContainer.propTypes = propTypes;

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps)(AppContainer);
