import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { adminFetchUsers } from 'actions/users';
import { getOrderedUsers } from 'selectors';
import Button from 'components/Button';
import Table from 'components/Table';
import translations from 'translations';

const propTypes = {
  lastUpdated: PropTypes.number,
  isFetching: PropTypes.bool.isRequired,
  items: PropTypes.array.isRequired,
};

const defaultProps = {
  isFetching: false,
  items: [],
};

const userListColumns = [
  {
    field: 'email',
    displayName: translations['userlist_th_email'],
  },
  {
    field: 'name',
    displayName: translations['userlist_th_name'],
  },
  {
    field: 'form_count',
    displayName: translations['userlist_th_form_count'],
  },
  {
    field: 'verified',
    displayFn: (row, col, field) => (
      <div>{row[field] ? 'Verified' : 'Unverified'}</div>
    ),
    displayName: translations['userlist_th_verified'],
  },
  {
    field: 'edit',
    displayFn: (row, col, field) => {
      return (
        <Link to={`/admin/users/${row['id']}`}>
          <Button>Edit</Button>
        </Link>
      );
    },
    displayName: translations['userlist_th_edit'],
  },
];

class AdminUserList extends React.Component {
  componentDidMount() {
    const { loadUsers } = this.props;
    loadUsers();
  }

  render() {
    const { users, isFetching } = this.props;

    return (
      <Table columns={userListColumns} data={users} isFetching={isFetching} />
    );
  }
}

AdminUserList.propTypes = propTypes;
AdminUserList.defaultProps = defaultProps;

const mapStateToProps = state => {
  return {
    users: getOrderedUsers(state),
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
