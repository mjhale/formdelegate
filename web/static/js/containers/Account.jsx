import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import Account from '../components/Account';

class AccountContainer extends Component {
  render() {
    return (
      <Account {...this.props} />
    );
  }
}

const mapStateToProps = (state) => {
  const { account, isFetching, lastUpdated } = state.account;
  return {
    account,
    isFetching,
    lastUpdated
  }
}

export default connect(mapStateToProps)(AccountContainer);
