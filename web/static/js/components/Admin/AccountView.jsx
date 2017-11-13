import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { adminFetchAccount } from 'actions/accounts';
import { getAccount } from 'selectors';

const propTypes = {
  account: PropTypes.object,
  isFetching: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired,
};

class AdminAccountView extends React.Component {
  componentDidMount() {
    const { loadAccount, match } = this.props;

    loadAccount(match.params.accountId);
  }

  render() {
    const { isFetching, account } = this.props;

    if (isFetching || !account) {
      return <p>Loading account...</p>;
    }

    return (
      <div className="account card">
        <h1>Account Management</h1>
        <div>E-Mail: {account.email}</div>
        <div>Name: {account.name}</div>
        <div>
          <Link to={`/admin/accounts/${account.id}/edit`}>Edit Account</Link>
        </div>
      </div>
    );
  }
}

AdminAccountView.propTypes = propTypes;

const mapStateToProps = (state, ownProps) => {
  return {
    account: getAccount(state, ownProps),
    isFetching: state.accounts.isFetching,
  };
};

const mapDispatchToProps = dispatch => ({
  loadAccount(accountId) {
    dispatch(adminFetchAccount(accountId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AdminAccountView);
