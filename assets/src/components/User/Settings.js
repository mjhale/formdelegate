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
    currentUser: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
  };

  handleUserUpdate = currentUser => {
    // @TODO: Add alert for update action
    this.props.updateUser(currentUser);
  };

  render() {
    const { currentUser, handleSubmit, submitting } = this.props;

    if (!currentUser) {
      return <div>Loading...</div>;
    }

    return (
      <React.Fragment>
        <h1>User Settings</h1>
        <Card>
          <form onSubmit={handleSubmit(this.handleUserUpdate)}>
            <Field
              component={renderField}
              label="Email"
              name="email"
              placeholder="Email"
              type="text"
            />
            <Field
              component={renderField}
              label="Full Name"
              name="name"
              placeholder="Full Name"
              type="text"
            />
            <Field
              component={renderField}
              label="Password"
              name="password"
              placeholder="Password"
              type="password"
            />
            <Button disabled={submitting} type="submit">
              Update User
            </Button>
          </form>
        </Card>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const currentUser = getCurrentUser(state);
  return {
    currentUser,
    initialValues: {
      id: currentUser && currentUser.id,
      name: currentUser && currentUser.name,
      email: currentUser && currentUser.email,
    },
  };
};

const mapDispatchToProps = {
  updateUser,
};

UserSettings = reduxForm({
  enableReinitialize: true,
  form: 'settingsForm',
})(UserSettings);

export default connect(mapStateToProps, mapDispatchToProps)(UserSettings);
