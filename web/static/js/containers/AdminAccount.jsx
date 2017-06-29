import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAccount } from '../actions/account';
import Account from '../components/Account';

const propTypes = {
  account: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
};

class AdminAccountContainer extends React.Component {
  componentDidMount() {
    const { dispatch, match } = this.props;
    const { accountId } = match.params;
    dispatch(fetchAccount(accountId));
  }

  render() {
    return <Account {...this.props} />;
  }
}

AdminAccountContainer.propTypes = propTypes;

const mapStateToProps = state => {
  const { account, isFetching, lastUpdated } = state.account;
  return {
    account,
    isFetching,
    lastUpdated,
  };
};

export default connect(mapStateToProps)(AdminAccountContainer);
