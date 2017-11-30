import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import UserSettings from 'components/User/Settings';
import Admin from 'components/Admin';
import App from 'components/App';
import Dashboard from 'components/Dashboard';
import Faq from 'components/Faq';
import FormEdit from 'components/FormEdit';
import FormNew from 'components/FormNew';
import Forms from 'components/Forms';
import InvalidRoute from 'components/InvalidRoute';
import Login from 'components/Auth/Login';
import Message from 'components/Message';
import Messages from 'components/Messages';
import Pricing from 'components/Pricing';
import RequestFailure from 'components/Request/Failure';
import RequestSuccess from 'components/Request/Success';
import Register from 'components/Auth/Register';
import requireAuth from 'components/Auth/RequireAuth';
import Welcome from 'components/Welcome';

export const RootRouter = () => (
  <BrowserRouter>
    <Route path="/" component={App} />
  </BrowserRouter>
);

export const Routes = () => (
  <Switch>
    <Route exact path="/dashboard" component={requireAuth(Dashboard)} />
    <Route exact path="/forms" component={requireAuth(Forms)} />
    <Route exact path="/forms/new" component={requireAuth(FormNew)} />
    <Route exact path="/forms/:formId/edit" component={requireAuth(FormEdit)} />
    <Route exact path="/messages" component={requireAuth(Messages)} />
    <Route exact path="/messages/:messageId" component={requireAuth(Message)} />
    <Route path="/admin" component={requireAuth(Admin)} />
    <Route exact path="/login" component={Login} />
    <Route exact path="/register" component={Register} />
    <Route exact path="/settings" component={UserSettings} />
    <Route exact path="/success" component={RequestSuccess} />
    <Route exact path="/failure" component={RequestFailure} />
    <Route exact path="/faq" component={Faq} />
    <Route exact path="/pricing" component={Pricing} />
    <Route exact path="/" component={Welcome} />
    <Route path="*" component={InvalidRoute} />
  </Switch>
);
