import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Admin from 'components/Admin';
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
import Pricing from 'components/Pricing';
import RequestFailure from 'components/Request/Failure';
import RequestSuccess from 'components/Request/Success';
import Register from 'components/Auth/Register';
import Submission from 'components/Submission';
import Submissions from 'components/Submissions';
import Support from 'components/Support';
import UserConfirmation from 'components/User/Confirmation';
import UserForgotPassword from 'components/User/ForgotPassword';
import UserSettings from 'components/User/Settings';
import Welcome from 'components/Welcome';

const LayoutRoute = ({ component: Component, layout: Layout, ...rest }) => {
  if (!Layout) {
    Layout = FluidLayout;
  }

  return (
    <Route
      {...rest}
      render={routeProps => {
        return (
          <Layout>
            <Component {...routeProps} />
          </Layout>
        );
      }}
    />
  );
};

const AuthenticatedLayoutRoute = ({
  component: Component,
  layout: Layout,
  ...rest
}) => {
  if (!Layout) {
    Layout = FluidLayout;
  }

  let isAuthenticated = useSelector(
    state => state.authentication.isAuthenticated
  );

  return (
    <Route
      {...rest}
      render={routeProps =>
        isAuthenticated ? (
          <Layout>
            <Component {...routeProps} />
          </Layout>
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: routeProps.location },
            }}
          />
        )
      }
    />
  );
};

const Routes = props => {
  return (
    <Switch>
      <LayoutRoute exact path="/" layout={FixedLayout} component={Welcome} />
      <AuthenticatedLayoutRoute exact path="/dashboard" component={Dashboard} />
      <LayoutRoute exact path="/failure" component={RequestFailure} />
      <LayoutRoute exact path="/faq" component={Faq} />
      <AuthenticatedLayoutRoute exact path="/forms" component={Forms} />
      <AuthenticatedLayoutRoute exact path="/forms/new" component={FormNew} />
      <AuthenticatedLayoutRoute
        exact
        path="/forms/:formId/edit"
        component={FormEdit}
      />
      <LayoutRoute exact path="/login" layout={AuthLayout} component={Login} />
      <AuthenticatedLayoutRoute exact path="/logout" component={Logout} />
      <LayoutRoute exact path="/pricing" component={Pricing} />
      <LayoutRoute exact path="/register" component={Register} />
      <AuthenticatedLayoutRoute
        exact
        path="/settings"
        component={UserSettings}
      />
      <AuthenticatedLayoutRoute
        exact
        path="/submissions"
        component={Submissions}
      />
      <AuthenticatedLayoutRoute
        exact
        path="/submissions/:submissionId"
        component={Submission}
      />
      <LayoutRoute exact path="/success" component={RequestSuccess} />
      <LayoutRoute exact path="/support" component={Support} />
      <LayoutRoute
        exact
        path="/reset"
        layout={AuthLayout}
        component={UserForgotPassword}
      />
      <LayoutRoute exact path="/confirmation" component={UserConfirmation} />
      <AuthenticatedLayoutRoute path="/admin" component={Admin} />
      <LayoutRoute path="*" component={InvalidRoute} />
    </Switch>
  );
};

export default Routes;
