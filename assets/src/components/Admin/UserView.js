import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { adminFetchUser } from 'actions/users';
import { getUser } from 'selectors';

import Card from 'components/Card';
import Link from 'components/Link';

class AdminUserView extends React.Component {
  static propTypes = {
    adminFetchUser: PropTypes.func.isRequired,
    isFetching: PropTypes.bool.isRequired,
    match: PropTypes.shape({
      params: PropTypes.object.isRequired,
    }).isRequired,
    user: PropTypes.object,
  };

  componentDidMount() {
    const { adminFetchUser, match } = this.props;

    adminFetchUser(match.params.userId);
  }

  render() {
    const { isFetching, user } = this.props;

    if (isFetching || !user) {
      return <p>Loading user...</p>;
    }

    return (
      <Card header="User Management">
        <div>E-Mail: {user.email}</div>
        <div>Name: {user.name}</div>
        <div>
          <Link href={`/admin/users/${user.id}/edit`}>Edit User</Link>
        </div>
      </Card>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  isFetching: state.users.isFetching,
  user: getUser(state, ownProps),
});

const mapDispatchToProps = {
  adminFetchUser,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminUserView);
