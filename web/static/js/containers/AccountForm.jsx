import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { fetchAccount, updateAccount } from 'actions/account';

const propTypes = {
  handleSubmit: PropTypes.func,
  fields: PropTypes.object,
};

class AccountFormContainer extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const { accountId } = this.props.params;
    dispatch(fetchAccount(accountId));
  }

  render() {
    const { dispatch, submitting, pristine, handleSubmit } = this.props;

    const doSubmit = (values) => {
      dispatch(updateAccount(values));
    }

    return (
      <form onSubmit={handleSubmit(doSubmit)}>
        <div>
          <label htmlFor="username">Username</label>
          <Field name="username" component="input" type="text" placeholder="Username" />
        </div>

        <div>
          <label htmlFor="username">Name</label>
          <Field name="name" component="input" type="text" placeholder="Full Name" />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <Field name="password" component="input" type="text" placeholder="Password" />
        </div>

        <button type="submit" disabled={submitting | pristine}>Save Changes</button>
      </form>
    );
  }
}

AccountFormContainer.propTypes = propTypes;

AccountFormContainer = reduxForm({
  form: 'account-edit',
  enableReinitialize: true,
})(AccountFormContainer);

const mapStateToProps = (state) => {
  const { account, isFetching, lastUpdated } = state.account;

  return {
    account,
    isFetching,
    lastUpdated,
    initialValues: account,
  }
}

export default connect(mapStateToProps)(AccountFormContainer);
