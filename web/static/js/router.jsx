import React from 'react';
import { Router, Route } from 'react-router';
import AboutContainer from './containers/About';
import AdminContainer from './containers/Admin';
import AdminAccountsContainer from './containers/AdminAccounts';
import AdminAccountContainer from './containers/AdminAccount';
import AdminAccountFormContainer from './containers/AdminAccountForm';
import HomeContainer from './containers/Home';
import InvalidRoute from './components/InvalidRoute';
import LoginContainer from './containers/Login';
import MessagesContainer from './containers/Messages';
import requireAuth from './containers/RequireAuth';

export const RootRouter = ({history}) => (
  <Router history={history}>
    <Route path="/" component={HomeContainer}>
      <Route path="about" component={AboutContainer}/>
      <Route path="messages" component={requireAuth(MessagesContainer)}/>
      <Route path="admin" component={requireAuth(AdminContainer)}>
        <Route path="accounts" component={AdminAccountsContainer}/>
        <Route path="accounts/:accountId" component={AdminAccountContainer}/>
        <Route path="accounts/:accountId/edit" component={AdminAccountFormContainer}/>
      </Route>
      <Route path="login" component={LoginContainer}/>
    </Route>
  </Router>
);
