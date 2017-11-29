import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { adminFetchAccount, adminUpdateAccount } from 'actions/accounts';
import { getAccount } from 'selectors';
import { withRouter } from 'react-router-dom';
import AdminAccountForm from 'components/Admin/AccountForm';

class AdminAccountFormContainer extends React.Component {
  componentDidMount() {
    const { loadAccount, match } = this.props;
    const { accountId } = match.params;

    loadAccount(accountId);
  }

  render() {
    {
      /* @TODO: Explicitly define required props */
    }
    const {
      error,
      onSubmit,
      pristine,
      submitting,
      reset,
      ...rest
    } = this.props;

    return (
      <AdminAccountForm
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
  const account = getAccount(state, ownProps);

  return {
    account,
    initialValues: {
      id: account && account.id,
      email: account && account.email,
      name: account && account.name,
    },
    isFetching: state.accounts.isFetching,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadAccount(accountId) {
    dispatch(adminFetchAccount(accountId));
  },

  onSubmit(data) {
    dispatch(adminUpdateAccount(data));
    ownProps.history.push(`/admin/accounts/${data.id}`);
  },
});

AdminAccountFormContainer = reduxForm({
  form: 'accountForm',
  enableReinitialize: true,
})(AdminAccountFormContainer);

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AdminAccountFormContainer)
);