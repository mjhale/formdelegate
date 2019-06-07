import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import translations from 'translations';
import { adminFetchUsers } from 'actions/users';
import { getOrderedUsers } from 'selectors';

import Button from 'components/Button';
import Link from 'components/Link';
import Table from 'components/Table';

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
    displayFn: (row, col, field) => (
      <Button as={Link} href={`/admin/users/${row['id']}`}>
        Edit
      </Button>
    ),
    displayName: translations['userlist_th_edit'],
  },
];

class AdminUserList extends React.Component {
  static propTypes = {
    adminFetchUsers: PropTypes.func.isRequired,
    isFetching: PropTypes.bool.isRequired,
    users: PropTypes.array.isRequired,
  };

  static defaultProps = {
    isFetching: false,
    users: [],
  };

  componentDidMount() {
    this.props.adminFetchUsers();
  }

  render() {
    const { users, isFetching } = this.props;

    return (
      <Table columns={userListColumns} data={users} isFetching={isFetching} />
    );
  }
}

const mapStateToProps = state => {
  return {
    isFetching: state.users.isFetching,
    users: getOrderedUsers(state),
  };
};

const mapDispatchToProps = { adminFetchUsers };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminUserList);
