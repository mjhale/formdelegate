import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';

import {
  adminFetchIntegration,
  adminUpdateIntegration,
} from 'actions/integrations';
import { getIntegration } from 'selectors';

import Button from 'components/Button';
import Card from 'components/Card';
import renderField from 'components/Field';

class AdminIntegrationForm extends React.Component {
  static propTypes = {
    adminFetchIntegration: PropTypes.func.isRequired,
    adminUpdateIntegration: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    integration: PropTypes.object,
    match: PropTypes.shape({
      params: PropTypes.object.isRequired,
    }).isRequired,
  };

  handleIntegrationUpdate = integration => {
    const { adminUpdateIntegration, history } = this.props;

    adminUpdateIntegration(integration).then(() =>
      history.push('/admin/integrations')
    );
  };

  componentDidMount() {
    const { adminFetchIntegration, match } = this.props;
    const { integrationId } = match.params;

    adminFetchIntegration(integrationId);
  }

  render() {
    const { handleSubmit, integration, submitting } = this.props;

    if (!integration) {
      return null;
    }

    return (
      <Card>
        <form onSubmit={handleSubmit(this.handleIntegrationUpdate)}>
          <h2>Integration Details</h2>
          <Field
            component={renderField}
            name="type"
            label="Type Name"
            type="text"
          />
          <Button disabled={submitting} type="submit">
            Update Integration
          </Button>
        </form>
      </Card>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const integration = getIntegration(state, ownProps);

  return {
    initialValues: {
      id: integration && integration.id,
      type: integration && integration.type,
    },
    integration,
  };
};

const mapDispatchToProps = {
  adminFetchIntegration,
  adminUpdateIntegration,
};

AdminIntegrationForm = reduxForm({
  enableReinitialize: true,
  form: 'integration',
})(AdminIntegrationForm);

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AdminIntegrationForm)
);
