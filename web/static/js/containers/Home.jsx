import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Nav from './Nav';

class HomeContainer extends React.Component {
  render() {
    const { children } = this.props;

    return (
      <div className="home">
        <div className="logo">Form Delegate</div>
        <Nav {...this.props} />
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
