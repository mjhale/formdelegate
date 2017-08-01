import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import AccountSettingsContainer from './containers/AccountSettings';
import AdminContainer from './containers/Admin';
import AppContainer from './containers/App';
import DashboardContainer from './containers/Dashboard';
import FormEditContainer from './containers/FormEdit';
import FormNewContainer from './containers/FormNew';
import FormsContainer from './containers/Forms';
import InvalidRoute from './components/InvalidRoute';
import LoginContainer from './containers/Login';
import MessageContainer from './containers/Message';
import MessagesContainer from './containers/Messages';
import ReceiveFailureContainer from './containers/ReceiveFailure';
import ReceiveSuccessContainer from './containers/ReceiveSuccess';
import RegisterContainer from './containers/RegisterAccount';
import requireAuth from './containers/RequireAuth';
import Welcome from './components/Welcome';

export const RootRouter = () =>
  <BrowserRouter>
    <Route path="/" component={AppContainer} />
  </BrowserRouter>;

export const Routes = () =>
  <Switch>
    <Route
      exact
      path="/dashboard"
      component={requireAuth(DashboardContainer)}
    />
    <Route exact path="/forms" component={requireAuth(FormsContainer)} />
    <Route exact path="/forms/new" component={requireAuth(FormNewContainer)} />
    <Route
      exact
      path="/forms/:formId/edit"
      component={requireAuth(FormEditContainer)}
    />
    <Route exact path="/messages" component={requireAuth(MessagesContainer)} />
    <Route
      exact
      path="/messages/:messageId"
      component={requireAuth(MessageContainer)}
    />
    <Route path="/admin" component={requireAuth(AdminContainer)} />
    <Route exact path="/login" component={LoginContainer} />
    <Route exact path="/register" component={RegisterContainer} />
    <Route exact path="/settings" component={AccountSettingsContainer} />
    <Route exact path="/success" component={ReceiveSuccessContainer} />
    <Route exact path="/failure" component={ReceiveFailureContainer} />
    <Route exact path="/" component={Welcome} />
    <Route path="*" component={InvalidRoute} />
  </Switch>;
