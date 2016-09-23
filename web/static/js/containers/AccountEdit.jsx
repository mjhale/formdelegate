import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { fetchAccount, updateAccount } from 'actions/account';
import AccountForm from 'components/AccountForm';

class AccountFormContainer extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const { accountId } = this.props.params;
    dispatch(fetchAccount(accountId));
  }

  componentWillReceiveProps(nextProps) {
  }

  onSubmit(values, dispatch) {
    dispatch(updateAccount(values));
  }

  render() {
    return (
      <AccountForm {... this.props} onSubmit={this.onSubmit} />
    );
  }
}

AccountFormContainer = reduxForm({
  form: 'accountForm',
  enableReinitialize: true,
})(AccountFormContainer);

const mapStateToProps = (state) => {
  const { account } = state.account;
  return {
    account,
    initialValues: account,
  };
};

export default connect(mapStateToProps)(AccountFormContainer);
