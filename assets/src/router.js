import PropTypes from 'prop-types';
import React from 'react';
import { BrowserRouter, Route, Switch, withRouter } from 'react-router-dom';

import Admin from 'components/Admin';
import App from 'components/App';
import AuthLayout from 'components/Layouts/AuthLayout';
import Dashboard from 'components/Dashboard';
import Faq from 'components/Faq';
import FixedLayout from 'components/Layouts/FixedLayout';
import FluidLayout from 'components/Layouts/FluidLayout';
import FormEdit from 'components/FormEdit';
import FormNew from 'components/FormNew';
import Forms from 'components/Forms';
import InvalidRoute from 'components/InvalidRoute';
import Login from 'components/Auth/Login';
import Logout from 'components/Auth/Logout';
import Message from 'components/Message';
import Messages from 'components/Messages';
import Pricing from 'components/Pricing';
import RequestFailure from 'components/Request/Failure';
import RequestSuccess from 'components/Request/Success';
import Register from 'components/Auth/Register';
import Support from 'components/Support';
import UserSettings from 'components/User/Settings';
import requireAuth from 'components/Auth/RequireAuth';
import Welcome from 'components/Welcome';

const AppRoute = ({ component: Component, layout: Layout, ...rest }) => {
  if (!Layout) {
    Layout = FluidLayout;
  }

  return (
    <Route
      {...rest}
      render={props => (
        <Layout>
          <Component {...props} />
        </Layout>
      )}
    />
  );
};

export const RootRouter = () => (
  <BrowserRouter>
    <Route path="/" component={App} />
  </BrowserRouter>
);

export const Routes = props => (
  <Switch>
    <AppRoute exact path="/" component={Welcome} layout={FixedLayout} />;
    <AppRoute exact path="/dashboard" component={requireAuth(Dashboard)} />
    <AppRoute exact path="/failure" component={RequestFailure} />
    <AppRoute exact path="/faq" component={Faq} />
    <AppRoute exact path="/forms" component={requireAuth(Forms)} />
    <AppRoute exact path="/forms/new" component={requireAuth(FormNew)} />
    <AppRoute
      exact
      path="/forms/:formId/edit"
      component={requireAuth(FormEdit)}
    />
    <AppRoute exact path="/login" component={Login} layout={AuthLayout} />
    <AppRoute exact path="/logout" component={Logout} />
    <AppRoute exact path="/messages" component={requireAuth(Messages)} />
    <AppRoute
      exact
      path="/messages/:messageId"
      component={requireAuth(Message)}
    />
    <AppRoute exact path="/pricing" component={Pricing} />
    <AppRoute exact path="/register" component={Register} />
    <AppRoute exact path="/settings" component={UserSettings} />
    <AppRoute exact path="/success" component={RequestSuccess} />
    <AppRoute exact path="/support" component={Support} />
    <AppRoute path="/admin" component={requireAuth(Admin)} />
    <AppRoute path="*" component={InvalidRoute} />
  </Switch>
);

Routes.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

export default withRouter(Routes);
