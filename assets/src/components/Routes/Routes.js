import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Admin from 'components/Admin';
import AuthLayout from 'components/Layouts/AuthLayout';
import FluidLayout from 'components/Layouts/FluidLayout';

const LayoutRoute = ({ component: Component, layout: Layout, ...rest }) => {
  if (!Layout) {
    Layout = FluidLayout;
  }

  return (
    <Route
      {...rest}
      render={(routeProps) => {
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
    (state) => state.authentication.isAuthenticated
  );

  return (
    <Route
      {...rest}
      render={(routeProps) =>
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

const Routes = (props) => {
  return (
    <Switch>
      <AuthenticatedLayoutRoute path="/admin" component={Admin} />
    </Switch>
  );
};

export default Routes;
