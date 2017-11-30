import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { adminFetchUsers } from 'actions/users';
import { getOrderedUsers } from 'selectors';

const propTypes = {
  lastUpdated: PropTypes.number,
  isFetching: PropTypes.bool.isRequired,
  items: PropTypes.array.isRequired,
};

const defaultProps = {
  isFetching: false,
  items: [],
};

class AdminUserList extends React.Component {
  componentDidMount() {
    const { loadUsers } = this.props;
    loadUsers();
  }

  render() {
    const { items, isFetching, lastUpdated } = this.props;
    const isEmpty = items.length === 0;

    return (
      <div>
        <table className="users table-minimal">
          <thead>
            <tr>
              <th>E-Mail Address</th>
              <th>Forms Count</th>
              <th>Verified Status</th>
            </tr>
          </thead>
          <tbody>
            {isEmpty &&
              !isFetching && (
                <tr>
                  <td colSpan="4">No users found.</td>
                </tr>
              )}
            {!isEmpty &&
              items.map(user => (
                <tr key={user.id}>
                  <td>
                    <Link to={`/admin/users/${user.id}`}>{user.email}</Link>
                  </td>
                  <td>{user.form_count}</td>
                  <td>{user.verified ? 'Verified' : 'Unverified'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  }
}

AdminUserList.propTypes = propTypes;
AdminUserList.defaultProps = defaultProps;

const mapStateToProps = state => {
  return {
    items: getOrderedUsers(state),
    isFetching: state.users.isFetching,
    lastUpdated: state.users.lastUpdated,
  };
};

const mapDispatchToProps = dispatch => ({
  loadUsers() {
    dispatch(adminFetchUsers());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AdminUserList);
