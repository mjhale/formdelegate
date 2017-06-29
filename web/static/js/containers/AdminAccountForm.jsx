import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { browserHistory } from 'react-router-dom';
import { fetchAccount, updateAccount } from 'actions/account';
import { withRouter } from 'react-router-dom';
import AccountForm from 'components/AccountForm';

class AdminAccountFormContainer extends React.Component {
  componentDidMount() {
    const { accountId } = this.props.match.params;
    this.props.dispatch(fetchAccount(accountId));
  }

  render() {
    {/* @TODO: Explicitly define required props */}
    const { error, onSubmit, pristine, submitting, reset, ...rest } = this.props;

    return (
      <AccountForm
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

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmit(data) {
    dispatch(updateAccount(data));
    ownProps.history.push(`/admin/accounts/${data.id}`);
  }
});

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminAccountFormContainer));
