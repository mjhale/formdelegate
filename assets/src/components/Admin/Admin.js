import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components/macro';
import { connect } from 'react-redux';
import { NavLink, Route, Switch } from 'react-router-dom';

import theme from 'constants/theme';
import { addNotification } from 'actions/notifications';
import { getCurrentUser } from 'selectors';

import Dashboard from 'components/Admin/Dashboard';
import IntegrationForm from 'components/Admin/IntegrationForm';
import IntegrationList from 'components/Admin/IntegrationList';
import UserFormContainer from 'components/Admin/UserFormContainer';
import UserList from 'components/Admin/UserList';
import UserView from 'components/Admin/UserView';

const AdminNavigation = styled.ul`
  background-color: ${theme.primaryColor};
  display: flex;
  justify-content: flex-start;
  list-style-type: none;
  padding: 1rem;

  & li {
    font-size: 0.8rem;
    text-transform: uppercase;
  }

  & li:not(:first-child) {
    margin-left: 1.5rem;
  }
`;

const AdminLink = styled(NavLink).attrs({ activeClassName: 'active' })`
  color: ${theme.navTextColor};
  text-decoration: none;

  &:hover {
    color: ${theme.offWhite};
  }

  &.${props => props.activeClassName} {
    border-bottom: 3px solid ${theme.carnation};
    color: ${theme.offWhite};
  }
`;

const Admin = ({ currentUser, showAuthorizationError }) => {
  if (!currentUser) {
    return null;
  }

  if (!currentUser.is_admin) {
    showAuthorizationError();
    return null;
  }

  return (
    <React.Fragment>
      <h1>Administration</h1>
      <AdminNavigation>
        <li>
          <AdminLink exact to="/admin" activeClassName="active">
            Dashboard
          </AdminLink>
        </li>
        <li>
          <AdminLink to="/admin/users" activeClassName="active">
            Users
          </AdminLink>
        </li>
        <li>
          <AdminLink to="/admin/integrations" activeClassName="active">
            Integrations
          </AdminLink>
        </li>
      </AdminNavigation>

      <Switch>
        <Route exact path="/admin" component={Dashboard} />
        <Route exact path="/admin/users" component={UserList} />
        <Route exact path="/admin/users/:userId" component={UserView} />
        <Route
          exact
          path="/admin/users/:userId/edit"
          component={UserFormContainer}
        />
        <Route exact path="/admin/integrations" component={IntegrationList} />
        <Route
          exact
          path="/admin/integrations/:integrationId"
          component={IntegrationForm}
        />
      </Switch>
    </React.Fragment>
  );
};

Admin.propTypes = {
  currentUser: PropTypes.object,
  showAuthorizationError: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  currentUser: getCurrentUser(state),
});

const mapDispatchToProps = dispatch => ({
  showAuthorizationError: () => {
    dispatch(
      addNotification({
        dismissable: false,
        level: 'error',
        message: 'You are not authorized to access this area.',
      })
    );
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
