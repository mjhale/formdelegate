import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getCurrentUser } from 'selectors';
import { getCurrentUserId } from 'utils';
import { updateUser } from 'actions/users';
import { Field, reduxForm } from 'redux-form';
import renderField from 'components/Field';

const propTypes = {
  user: PropTypes.object,
  isFetching: PropTypes.bool.isRequired,
};

let UserSettings = props => {
  const { user, handleSubmit, isFetching, submitting } = props;

  if (!user || isFetching) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      <h1>User Settings</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <Field
            name="email"
            component={renderField}
            type="text"
            label="E-mail Address"
          />
          <Field
            name="name"
            component={renderField}
            type="text"
            label="Full Name"
          />
          <Field
            name="password"
            component={renderField}
            type="password"
            label="Password"
          />
          <button type="submit" className="btn" disabled={submitting}>
            Update User
          </button>
        </form>
      </div>
    </div>
  );
};

UserSettings.propTypes = propTypes;

const mapStateToProps = state => {
  const user = getCurrentUser(state);

  return {
    user,
    initialValues: {
      id: user && user.id,
      name: user && user.name,
      email: user && user.email,
    },
    isFetching: state.users.isFetching,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmit(data) {
    dispatch(updateUser(data));
  },
});

UserSettings = reduxForm({
  enableReinitialize: true,
  form: 'settingsForm',
})(UserSettings);

export default connect(mapStateToProps, mapDispatchToProps)(UserSettings);
