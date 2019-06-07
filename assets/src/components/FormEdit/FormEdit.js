import PropTypes from 'prop-types';
import React from 'react';
import { change, Field, reduxForm, untouch } from 'redux-form';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import styled from 'styled-components/macro';

import renderField from 'components/Field';
import { fetchForm, updateForm } from 'actions/forms';
import { fetchIntegrations } from 'actions/integrations';
import { formSchema } from 'schema';

import Button from 'components/Button';
import Card from 'components/Card';
import FormIntegrationList from 'components/FormIntegrations/IntegrationList';

const VerifiedStatus = styled.div`
  float: right;
  text-transform: none;
`;

const CardHeader = ({ title, isVerified }) => (
  <React.Fragment>
    <VerifiedStatus>{isVerified ? 'Verified' : 'Unverified'}</VerifiedStatus>
    {title}
  </React.Fragment>
);

class FormEdit extends React.Component {
  static propTypes = {
    fetchForm: PropTypes.func.isRequired,
    fetchIntegrations: PropTypes.func.isRequired,
    formData: PropTypes.object,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    integrations: PropTypes.object,
    isFetching: PropTypes.bool.isRequired,
    match: PropTypes.shape({
      params: PropTypes.object.isRequired,
    }).isRequired,
    updateForm: PropTypes.func.isRequired,
  };

  state = { newIntegrationFields: 0 };

  handleFormEdit = form => {
    const { updateForm, history } = this.props;

    updateForm(form).then(() => history.push('/forms/'));
  };

  removeIntegrationField = integrationField => {
    change('formForm', `${integrationField}[enabled]`, null);
    change('formForm', `${integrationField}[settings][api_key]`, null);
    change('formForm', `${integrationField}[settings][email]`, null);
    untouch('formForm', `${integrationField}[enabled]`);
    untouch('formForm', `${integrationField}[settings][api_key]`);
    untouch('formForm', `${integrationField}[settings][email]`);
  };

  componentDidMount() {
    const { fetchForm, fetchIntegrations, match } = this.props;

    fetchForm(match.params.formId);
    fetchIntegrations();
  }

  render() {
    const {
      formData,
      handleSubmit,
      integrations,
      isFetching,
      submitting,
    } = this.props;

    if (isFetching || !formData) {
      return <div>Loading form...</div>;
    }

    return (
      <React.Fragment>
        <h1>Edit Form</h1>

        <form onSubmit={handleSubmit(this.handleFormEdit)}>
          <Card
            header={
              <CardHeader
                title={formData.form}
                isVerified={formData.verified}
              />
            }
          >
            <h2>Form Details</h2>
            <Field
              component={renderField}
              label="Form Name"
              name="form"
              placeholder="Form Name"
              type="text"
            />
            <Field
              component={renderField}
              disabled
              label="Form ID"
              name="id"
              placeholder="Form ID"
              type="text"
            />
            <Field
              component={renderField}
              disabled
              label="Total Messages"
              name="message_count"
              placeholder="Total Messages"
              type="text"
            />

            <FormIntegrationList
              integrations={formData.form_integrations}
              integrationTypes={integrations}
              removeIntegration={this.removeIntegrationField}
            />
          </Card>
          <Button disabled={submitting} type="submit">
            Save Form
          </Button>
        </form>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const denormalizedForm = state.entities.forms
    ? denormalize(ownProps.match.params.formId, formSchema, state.entities)
    : null;

  return {
    formData: denormalizedForm,
    initialValues: denormalizedForm /* initialize redux form values */,
    integrations: state.entities.integrations,
    isFetching: state.forms.isFetching,
  };
};

const mapDispatchToProps = {
  change,
  fetchForm,
  fetchIntegrations,
  untouch,
  updateForm,
};

FormEdit = reduxForm({
  form: 'formForm',
})(FormEdit);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FormEdit);
