import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { adminFetchAccounts } from 'actions/accounts';
import { getOrderedAccounts } from '../selectors';

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
    const { loadAccounts } = this.props;
    loadAccounts();
  }

  render() {
    const { items, isFetching, lastUpdated } = this.props;
    const isEmpty = items.length === 0;

    return (
      <div>
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

const mapStateToProps = state => {
  return {
    items: getOrderedAccounts(state),
    isFetching: state.accounts.isFetching,
    lastUpdated: state.accounts.lastUpdated,
  };
};

const mapDispatchToProps = dispatch => ({
  loadAccounts() {
    dispatch(adminFetchAccounts());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  AdminAccountsContainer
);
