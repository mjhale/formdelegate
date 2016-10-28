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

class AdminAccountsContainer extends React.Component {
  componentDidMount() {
    this.props.dispatch(fetchAccountsIfNeeded());
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
              <th>Messages Count</th>
              <th>Verified Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((account) => (
              <tr key={account.id}>
                <td><Link to={`/admin/accounts/${account.id}`}>{account.username}</Link></td>
                <td>{account.messages_count}</td>
                <td>Unverified</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

AdminAccountsContainer.propTypes = propTypes;
AdminAccountsContainer.defaultProps = defaultProps;

/* @TODO: Memoize to improve performance */
const sortById = (accounts) => {
  return accounts.sort((a, b) => {
    if (a.hasOwnProperty('id') && b.hasOwnProperty('id')) {
      return a.id - b.id;
    }
  });
};

const mapStateToProps = (state) => {
  return {
    items: sortById(state.accounts.items),
    isFetching: state.accounts.isFetching,
    lastUpdated: state.accounts.lastUpdated,
  };
};

export default connect(mapStateToProps)(AdminAccountsContainer);
