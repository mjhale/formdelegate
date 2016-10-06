import React from 'react';
import { Router, Route } from 'react-router';

import AboutContainer from './containers/About';
import AccountsContainer from './containers/Accounts';
import AccountContainer from './containers/Account';
import AccountEditContainer from './containers/AccountEdit';
import HomeContainer from './containers/Home';
import InvalidRoute from './components/InvalidRoute';
import LoginContainer from './containers/Login';
import requireAuth from './containers/RequireAuth';

export const RootRouter = ({history}) => (
  <Router history={history}>
    <Route path="/" component={HomeContainer}>
      <Route path="about" component={AboutContainer}/>
      <Route path="accounts" component={requireAuth(AccountsContainer)}/>
      <Route path="accounts/:accountId" component={AccountContainer}/>
      <Route path="accounts/:accountId/edit" component={AccountEditContainer}/>
      <Route path="login" component={LoginContainer}/>
      <Route path="*" component={InvalidRoute}/>
    </Route>
  </Router>
);
