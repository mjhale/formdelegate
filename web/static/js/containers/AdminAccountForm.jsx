import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { browserHistory } from 'react-router';
import { fetchAccount, updateAccount } from 'actions/account';
import AccountForm from 'components/AccountForm';

class AdminAccountFormContainer extends React.Component {
  componentDidMount() {
    const { accountId } = this.props.params;
    this.props.dispatch(fetchAccount(accountId));
  }

  render() {
    return (
      <AccountForm {... this.props} />
    );
  }
}

AdminAccountFormContainer = reduxForm({
  form: 'accountForm',
  enableReinitialize: true,
})(AdminAccountFormContainer);

const mapStateToProps = (state) => {
  const { account } = state.account;
  return {
    account,
    initialValues: account,
  };
};

const mapDispatchToProps = (dispatch) => ({
  onSubmit(data) {
    dispatch(updateAccount(data));
    browserHistory.push(`/admin/accounts/${data.id}`);
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminAccountFormContainer);
