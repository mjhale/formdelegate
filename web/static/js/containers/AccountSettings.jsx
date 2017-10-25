import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getCurrentAccount } from '../selectors';
import { getCurrentAccountId } from '../utils';
import { fetchAccount, updateAccount } from '../actions/accounts';
import { Field, reduxForm } from 'redux-form';
import renderField from '../components/Field.jsx';

const propTypes = {
  account: PropTypes.object,
  isFetching: PropTypes.bool.isRequired,
};

class AccountSettingsContainer extends React.Component {
  componentDidMount() {
    const currentAccountId = getCurrentAccountId();
    this.props.loadAccount(currentAccountId);
  }

  render() {
    const { account, handleSubmit, isFetching, submitting } = this.props;

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
  }
}

AccountSettingsContainer.propTypes = propTypes;

const mapStateToProps = state => {
  const account = getCurrentAccount(state);

  return {
    account,
    initialValues: {
      name: account && account.name,
      email: account && account.email,
    },
    isFetching: state.accounts.isFetching,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadAccount(accountId) {
    dispatch(fetchAccount(accountId));
  },

  onSubmit(values) {
    // add current user's id to object
    values.id = getCurrentAccountId();
    dispatch(updateAccount(values));
  },
});

AccountSettingsContainer = reduxForm({
  enableReinitialize: true,
  form: 'settingsForm',
})(AccountSettingsContainer);

export default connect(mapStateToProps, mapDispatchToProps)(
  AccountSettingsContainer
);
