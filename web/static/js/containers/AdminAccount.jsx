import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { getAccount } from '../selectors';
import { fetchAccount } from '../actions/accounts';
import Account from '../components/Account';

const propTypes = {
  account: PropTypes.object,
  isFetching: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired,
};

class AdminAccountContainer extends React.Component {
  componentDidMount() {
    const { loadAccount, match } = this.props;
    const { accountId } = match.params;

    loadAccount(accountId);
  }

  render() {
    const { isFetching, account } = this.props;

    if (isFetching || !account) {
      return <p>Loading account...</p>;
    }

    return <Account {...this.props} />;
  }
}

AdminAccountContainer.propTypes = propTypes;

const mapStateToProps = (state, ownProps) => {
  return {
    account: getAccount(state, ownProps),
    isFetching: state.accounts.isFetching,
  };
};

const mapDispatchToProps = dispatch => ({
  loadAccount(accountId) {
    dispatch(fetchAccount(accountId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  AdminAccountContainer
);
