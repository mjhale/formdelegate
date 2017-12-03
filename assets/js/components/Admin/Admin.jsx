import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getCurrentUser } from 'selectors';
import { NavLink, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import UserFormContainer from 'components/Admin/UserFormContainer';
import UserList from 'components/Admin/UserList';
import UserView from 'components/Admin/UserView';
import Dashboard from 'components/Admin/Dashboard';
import Error from 'components/Error';
import IntegrationList from 'components/Admin/IntegrationList';
import IntegrationForm from 'components/Admin/IntegrationForm';
import theme from 'constants/theme';

const propTypes = {
  user: PropTypes.object,
  isAdmin: PropTypes.bool,
};

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

const Admin = ({ user, isAdmin }) => {
  if (!user) return null;

  if (!isAdmin)
    return <Error message="You are not authorized to access this area." />;

  return (
    <div>
      <h1>Administration</h1>
      <AdminNavigation role="nav">
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
    </div>
  );
};

Admin.propTypes = propTypes;

const mapStateToProps = state => {
  const user = getCurrentUser(state);

  return {
    user: getCurrentUser(state),
    isAdmin: user && user.is_admin,
  };
};

export default connect(mapStateToProps)(Admin);
