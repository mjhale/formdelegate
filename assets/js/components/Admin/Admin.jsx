import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getCurrentUser } from 'selectors';
import { NavLink, Route, Switch } from 'react-router-dom';
import UserFormContainer from 'components/Admin/UserFormContainer';
import UserList from 'components/Admin/UserList';
import UserView from 'components/Admin/UserView';
import Dashboard from 'components/Admin/Dashboard';
import Error from 'components/Error';
import IntegrationList from 'components/Admin/IntegrationList';
import IntegrationForm from 'components/Admin/IntegrationForm';

const propTypes = {
  user: PropTypes.object,
  isAdmin: PropTypes.bool,
};

const Admin = ({ user, isAdmin }) => {
  if (!user) return null;

  if (!isAdmin)
    return <Error message="You are not authorized to access this area." />;

  return (
    <div>
      <h1>Administration</h1>
      <ul className="admin-links" role="nav">
        <li>
          <NavLink exact to="/admin" activeClassName="active">
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/users" activeClassName="active">
            Users
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/integrations" activeClassName="active">
            Integrations
          </NavLink>
        </li>
      </ul>
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
