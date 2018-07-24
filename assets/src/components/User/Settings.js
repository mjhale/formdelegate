import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import renderField from 'components/Field';
import { getCurrentUser } from 'selectors';
import { updateUser } from 'actions/users';

import Button from 'components/Button';
import Card from 'components/Card';

class UserSettings extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    isFetching: PropTypes.bool.isRequired,
    updateUser: PropTypes.func.isRequired,
    user: PropTypes.object,
  };

  handleUserUpdate = user => {
    // @TODO: Add alert for update action
    this.props.updateUser(user);
  };

  render() {
    const { handleSubmit, isFetching, submitting, user } = this.props;

    if (!user || isFetching) {
      return <div>Loading...</div>;
    }

    return (
      <React.Fragment>
        <h1>User Settings</h1>
        <Card>
          <form onSubmit={handleSubmit(this.handleUserUpdate)}>
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
            <Button type="submit" disabled={submitting}>
              Update User
            </Button>
          </form>
        </Card>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const user = getCurrentUser(state);

  return {
    initialValues: {
      id: user && user.id,
      name: user && user.name,
      email: user && user.email,
    },
    isFetching: state.users.isFetching,
    user,
  };
};

const mapDispatchToProps = {
  updateUser,
};

UserSettings = reduxForm({
  enableReinitialize: true,
  form: 'settingsForm',
})(UserSettings);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserSettings);
