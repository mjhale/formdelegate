import React from 'react';
import { Router, Route } from 'react-router';
import AdminContainer from './containers/Admin';
import AdminAccountsContainer from './containers/AdminAccounts';
import AdminAccountContainer from './containers/AdminAccount';
import AdminAccountFormContainer from './containers/AdminAccountForm';
import HomeContainer from './containers/Home';
import IntegrationsContainer from './containers/Integrations';
import ReceiveSuccessContainer from './containers/ReceiveSuccess';
import ReceiveFailureContainer from './containers/ReceiveFailure';
import InvalidRoute from './components/InvalidRoute';
import LoginContainer from './containers/Login';
import MessagesContainer from './containers/Messages';
import FormsContainer from './containers/Forms';
import requireAuth from './containers/RequireAuth';

export const RootRouter = ({history}) => (
  <Router history={history}>
    <Route path="/" component={HomeContainer}>
      <Route path="forms" component={requireAuth(FormsContainer)}/>
      <Route path="messages" component={requireAuth(MessagesContainer)}/>
      <Route path="integrations" component={requireAuth(IntegrationsContainer)}/>
      <Route path="admin" component={requireAuth(AdminContainer)}>
        <Route path="accounts" component={AdminAccountsContainer}/>
        <Route path="accounts/:accountId" component={AdminAccountContainer}/>
        <Route path="accounts/:accountId/edit" component={AdminAccountFormContainer}/>
      </Route>
      <Route path="login" component={LoginContainer}/>
      <Route path="success" component={ReceiveSuccessContainer}/>
      <Route path="failure" component={ReceiveFailureContainer}/>
      <Route path="*" component={InvalidRoute}/>
    </Route>
  </Router>
);
