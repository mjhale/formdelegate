import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import Account from '../components/Account';
import { fetchAccount } from '../actions/account';

const propTypes = {
  account: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
};

class AccountContainer extends Component {
  componentDidMount() {
    const { dispatch, params } = this.props;
    const { accountId } = params;
    dispatch(fetchAccount(accountId));
  }

  render() {
    return (
      <Account {...this.props} />
    );
  }
}

AccountContainer.propTypes = propTypes;

const mapStateToProps = (state) => {
  const { account, isFetching, lastUpdated } = state.account;
  return {
    account,
    isFetching,
    lastUpdated,
  };
};

export default connect(mapStateToProps)(AccountContainer);
