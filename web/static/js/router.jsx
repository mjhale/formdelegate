import React from 'react';
import { Router, Route, IndexRoute } from 'react-router';

import AdminContainer from './containers/Admin';
import AdminAccountContainer from './containers/AdminAccount';
import AdminAccountFormContainer from './containers/AdminAccountForm';
import AdminAccountsContainer from './containers/AdminAccounts';
import FormsContainer from './containers/Forms';
import HomeContainer from './containers/Home';
import InvalidRoute from './components/InvalidRoute';
import LoginContainer from './containers/Login';
import MessageContainer from './containers/Message';
import MessagesContainer from './containers/Messages';
import ReceiveFailureContainer from './containers/ReceiveFailure';
import ReceiveSuccessContainer from './containers/ReceiveSuccess';
import requireAuth from './containers/RequireAuth';
import Welcome from './components/Welcome';

export const RootRouter = ({history}) => (
  <Router history={history}>
    <Route path="/" component={HomeContainer}>
      <IndexRoute component={Welcome} />
      <Route path="forms" component={requireAuth(FormsContainer)}/>
      <Route path="messages" component={requireAuth(MessagesContainer)}/>
      <Route path="messages/:messageId" component={requireAuth(MessageContainer)}/>
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
