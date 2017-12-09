import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { adminFetchUser, adminUpdateUser } from 'actions/users';
import { getUser } from 'selectors';
import { withRouter } from 'react-router-dom';
import AdminUserForm from 'components/Admin/UserForm';

class AdminUserFormContainer extends React.Component {
  componentDidMount() {
    const { loadUser, match } = this.props;
    const { userId } = match.params;

    loadUser(userId);
  }

  render() {
    /* @TODO: Explicitly define required props */
    const {
      error,
      onSubmit,
      pristine,
      submitting,
      reset,
      ...rest
    } = this.props;

    return (
      <AdminUserForm
        {...rest}
        error={error}
        onSubmit={onSubmit}
        pristine={pristine}
        submitting={submitting}
        reset={reset}
      />
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

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadUser(userId) {
    dispatch(adminFetchUser(userId));
  },

  onSubmit(data) {
    dispatch(adminUpdateUser(data));
    ownProps.history.push(`/admin/users/${data.id}`);
  },
});

AdminUserFormContainer = reduxForm({
  form: 'userForm',
  enableReinitialize: true,
})(AdminUserFormContainer);

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AdminUserFormContainer)
);
