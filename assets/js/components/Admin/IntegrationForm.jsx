import React from 'react';
import PropTypes from 'prop-types';
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

const propTypes = {
  integration: PropTypes.object.isRequired,
};

class AdminIntegrationForm extends React.Component {
  componentDidMount() {
    const { loadIntegration, match } = this.props;
    const { integrationId } = match.params;

    loadIntegration(integrationId);
  }

  render() {
    const { handleSubmit, integration, submitting } = this.props;

    return (
      <Card>
        <form onSubmit={handleSubmit}>
          <Field
            component={renderField}
            name="type"
            label="Type Name"
            type="text"
          />
          <Button type="submit" disabled={submitting}>
            Update Integration
          </Button>
        </form>
      </Card>
    );
  }
}

AdminIntegrationForm.propTypes = propTypes;

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

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadIntegration(integrationId) {
    dispatch(adminFetchIntegration(integrationId));
  },

  onSubmit(data) {
    dispatch(adminUpdateIntegration(data));
    ownProps.history.push('/admin/integrations');
  },
});

AdminIntegrationForm = reduxForm({
  enableReinitialize: true,
  form: 'integration',
})(AdminIntegrationForm);

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AdminIntegrationForm)
);
