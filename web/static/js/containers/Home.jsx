import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Nav from './Nav';

class HomeContainer extends React.Component {
  render() {
    const { children } = this.props;

    return (
      <div className="home">
        <nav className="navigation">
          <div className="logo">Form Delegate</div>
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
