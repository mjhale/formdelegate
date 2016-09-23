import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { fetchAccountsIfNeeded } from 'actions/accounts';

const propTypes = {
  lastUpdated: PropTypes.number,
  isFetching: PropTypes.bool.isRequired,
  items: PropTypes.array.isRequired,
};

const defaultProps = {
  isFetching: false,
  items: [],
};

class AccountsContainer extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchAccountsIfNeeded());
  }

  render() {
    const { items, isFetching, lastUpdated } = this.props;
    const isEmpty = items.length === 0;

    return (
      <div>
        <h1>Accounts</h1>
        <table className="accounts table-minimal">
          <thead>
            <tr>
              <th>Account Name</th>
              <th>Message Count</th>
              <th>Verified Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((account) => (
              <tr key={account.id}>
                <td><Link to={`/accounts/${account.id}`}>{account.username}</Link></td>
                <td>500</td>
                <td>Unverified</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

AccountsContainer.propTypes = propTypes;
AccountsContainer.defaultProps = defaultProps;

const mapStateToProps = (state) => {
  return {
    items: state.accounts.items,
    isFetching: state.accounts.isFetching,
    lastUpdated: state.accounts.lastUpdated,
  };
};

export default connect(mapStateToProps)(AccountsContainer);
