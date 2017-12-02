import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Card from 'components/Card';
import { adminFetchUser } from 'actions/users';
import { getUser } from 'selectors';

const propTypes = {
  user: PropTypes.object,
  isFetching: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired,
};

class AdminUserView extends React.Component {
  componentDidMount() {
    const { loadUser, match } = this.props;

    loadUser(match.params.userId);
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
          <Link to={`/admin/users/${user.id}/edit`}>Edit User</Link>
        </div>
      </Card>
    );
  }
}

AdminUserView.propTypes = propTypes;

const mapStateToProps = (state, ownProps) => {
  return {
    user: getUser(state, ownProps),
    isFetching: state.users.isFetching,
  };
};

const mapDispatchToProps = dispatch => ({
  loadUser(userId) {
    dispatch(adminFetchUser(userId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AdminUserView);
