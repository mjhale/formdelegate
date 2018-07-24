import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';

import { adminFetchUser, adminUpdateUser } from 'actions/users';
import { getUser } from 'selectors';

import AdminUserForm from 'components/Admin/UserForm';

class AdminUserFormContainer extends React.Component {
  static propTypes = {
    adminFetchUser: PropTypes.func.isRequired,
    adminUpdateUser: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    isFetching: PropTypes.bool.isRequired,
    match: PropTypes.shape({
      params: PropTypes.object.isRequired,
    }).isRequired,
    user: PropTypes.object,
  };

  handleUserEdit = user => {
    const { adminUpdateUser, history } = this.props;

    adminUpdateUser(user).then(() => history.push(`/admin/users/${user.id}`));
  };

  componentDidMount() {
    const { adminFetchUser, match } = this.props;
    const { userId } = match.params;

    adminFetchUser(userId);
  }

  render() {
    const { handleSubmit, ...rest } = this.props;

    return (
      <AdminUserForm {...rest} onSubmit={handleSubmit(this.handleUserEdit)} />
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const user = getUser(state, ownProps);

  return {
    user,
    initialValues: {
      id: user && user.id,
      email: user && user.email,
      name: user && user.name,
    },
    isFetching: state.users.isFetching,
  };
};

const mapDispatchToProps = {
  adminFetchUser,
  adminUpdateUser,
};

AdminUserFormContainer = reduxForm({
  form: 'userForm',
  enableReinitialize: true,
})(AdminUserFormContainer);

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AdminUserFormContainer)
);
