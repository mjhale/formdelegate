import React from 'react';
import { Router, Route } from 'react-router';

import AboutContainer from './containers/About';
import AccountsContainer from './containers/Accounts';
import AccountContainer from './containers/Account';
import AccountFormContainer from './containers/AccountForm';
import HomeContainer from './containers/Home';
import InvalidRoute from './components/Invalid';

export const RootRouter = ({history}) => (
	<Router history={history}>
		<Route path="/" component={HomeContainer}>
			<Route path="about" component={AboutContainer}/>
			<Route path="accounts" component={AccountsContainer}/>
			<Route path="/accounts/:accountId" component={AccountContainer}/>
			<Route path="/accounts/:accountId/edit" component={AccountFormContainer}/>
			<Route path="*" component={InvalidRoute}/>
		</Route>
	</Router>
);
