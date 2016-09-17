import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { fetchAccountsIfNeeded } from 'actions/accounts';

const propTypes = {
	lastUpdated: PropTypes.number,
	isFetching: PropTypes.bool.isRequired,
	items: PropTypes.array.isRequired,
};

const defaultProps = {
	isFetching: false,
	items: [],
};

class AccountsContainer extends React.Component {
	componentDidMount() {
		const { dispatch } = this.props;
		dispatch(fetchAccountsIfNeeded());
	}

  render() {
		const { items, isFetching, lastUpdated } = this.props;
		const isEmpty = items.length === 0;

    return (
      <div>
        <h1>Accounts</h1>
        <div className="accounts">
					{isEmpty
	          ? (isFetching ? <p>Loading data...</p> : null)
	          :	<ul style={{ opacity: isFetching ? 0.5 : 1 }}>
							{items.map((account) => (
								<li key={account.id}>
									<Link to={`/accounts/${account.id}`}>{account.username}</Link>
									<p>Password: {account.password_hash}</p>
								</li>
							))}
		          </ul>
	        }

        </div>
				<p>Updated: {lastUpdated}</p>
      </div>
    );
  }
}

AccountsContainer.propTypes = propTypes;
AccountsContainer.defaultProps = defaultProps;

const mapStateToProps = (state) => {
	return {
		items: state.accounts.items,
		isFetching: state.accounts.isFetching,
		lastUpdated: state.accounts.lastUpdated
	}
}

export default connect(mapStateToProps)(AccountsContainer);
