import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { fetchAccount } from '../actions/account';
import Account from '../components/Account';

const propTypes = {
  account: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
};

class AdminAccountContainer extends React.Component {
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

AdminAccountContainer.propTypes = propTypes;

const mapStateToProps = (state) => {
  const { account, isFetching, lastUpdated } = state.account;
  return {
    account,
    isFetching,
    lastUpdated,
  };
};

export default connect(mapStateToProps)(AdminAccountContainer);
