import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getCurrentAccount } from 'selectors';
import { getCurrentAccountId } from 'utils';
import { updateAccount } from 'actions/accounts';
import { Field, reduxForm } from 'redux-form';
import renderField from 'components/Field';

const propTypes = {
  account: PropTypes.object,
  isFetching: PropTypes.bool.isRequired,
};

let AccountSettings = props => {
  const { account, handleSubmit, isFetching, submitting } = props;

  if (!account || isFetching) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="fluid-container">
      <h1>Account Settings</h1>
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
            Update Account
          </button>
        </form>
      </div>
    </div>
  );
};

AccountSettings.propTypes = propTypes;

const mapStateToProps = state => {
  const account = getCurrentAccount(state);

  return {
    account,
    initialValues: {
      id: account && account.id,
      name: account && account.name,
      email: account && account.email,
    },
    isFetching: state.accounts.isFetching,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmit(data) {
    dispatch(updateAccount(data));
  },
});

AccountSettings = reduxForm({
  enableReinitialize: true,
  form: 'settingsForm',
})(AccountSettings);

export default connect(mapStateToProps, mapDispatchToProps)(AccountSettings);