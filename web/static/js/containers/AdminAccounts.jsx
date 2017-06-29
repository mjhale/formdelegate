import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
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
              <th>E-Mail Address</th>
              <th>Forms Count</th>
              <th>Verified Status</th>
            </tr>
          </thead>
          <tbody>
            {isEmpty &&
              !isFetching &&
              <tr>
                <td colSpan="4">No accounts found.</td>
              </tr>}
            {!isEmpty &&
              items.map(account =>
                <tr key={account.id}>
                  <td>
                    <Link to={`/admin/accounts/${account.id}`}>
                      {account.email}
                    </Link>
                  </td>
                  <td>
                    {account.form_count}
                  </td>
                  <td>
                    {account.verified ? 'Verified' : 'Unverified'}
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    );
  }
}

AdminAccountsContainer.propTypes = propTypes;
AdminAccountsContainer.defaultProps = defaultProps;

/* @TODO: Memoize to improve performance */
const sortById = accounts => {
  return accounts.sort((a, b) => {
    if (a.hasOwnProperty('id') && b.hasOwnProperty('id')) {
      return a.id - b.id;
    }
  });
};

const mapStateToProps = state => {
  return {
    items: sortById(state.accounts.items),
    isFetching: state.accounts.isFetching,
    lastUpdated: state.accounts.lastUpdated,
  };
};

export default connect(mapStateToProps)(AdminAccountsContainer);
