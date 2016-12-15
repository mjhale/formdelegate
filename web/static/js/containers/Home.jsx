import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Nav from './Nav';

class HomeContainer extends React.Component {
  render() {
    const { children } = this.props;

    return (
      <div className="home">
        <nav className="navigation">
          <Link to="/" className="logo">form delegate</Link>
          <Nav {...this.props} />
        </nav>
        <div className="content">
          {children}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps)(HomeContainer);
