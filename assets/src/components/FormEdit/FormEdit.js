import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import { fetchForm, updateForm } from 'actions/forms';
import { fetchIntegrations } from 'actions/integrations';
import { change, Field, reduxForm, untouch } from 'redux-form';
import { formSchema } from 'schema';
import styled from 'styled-components';
import Button from 'components/Button';
import Card from 'components/Card';
import FormIntegrationList from 'components/FormIntegrations/IntegrationList';

const propTypes = {
  initialValues: PropTypes.object,
  isFetching: PropTypes.bool.isRequired,
};

const VerifiedStatus = styled.div`
  float: right;
  text-transform: none;
`;

const CardHeader = ({ title, isVerified }) => (
  <div>
    <VerifiedStatus>{isVerified ? 'Verified' : 'Unverified'}</VerifiedStatus>
    {title}
  </div>
);

class FormEdit extends React.Component {
  constructor() {
    super();
    this.state = { newIntegrationFields: 0 };
  }

  componentDidMount() {
    this.props.loadForm();
    this.props.loadIntegrationTypes();
  }

  render() {
    const {
      formData,
      handleSubmit,
      isFetching,
      removeIntegration,
      submitting,
    } = this.props;
    const integrationTypes = this.props.integrations;

    if (isFetching || !formData) {
      return <div>Loading form...</div>;
    }

    return (
      <div>
        <h1>Edit Form</h1>
        <form onSubmit={handleSubmit}>
          <Card
            header={
              <CardHeader
                title={formData.form}
                isVerified={formData.verified}
              />
            }
          >
            <div>
              <label>Form Name</label>
              <Field name="form" component="input" type="text" />
            </div>
            <div>
              <label>Form ID</label>
              <Field name="id" component="input" type="text" disabled />
            </div>
            <div>
              <label>Number of Messages</label>
              <Field
                name="message_count"
                component="input"
                type="text"
                disabled
              />
            </div>
            <FormIntegrationList
              integrations={formData.form_integrations}
              integrationTypes={integrationTypes}
              removeIntegration={removeIntegration}
            />
          </Card>
          <Button type="submit" disabled={submitting}>
            Save Form
          </Button>
        </form>
      </div>
    );
  }
}

FormEdit.propTypes = propTypes;

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

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadForm() {
    dispatch(fetchForm(ownProps.match.params.formId));
  },

  loadIntegrationTypes() {
    dispatch(fetchIntegrations());
  },

  onSubmit(values) {
    dispatch(updateForm(values));
    ownProps.history.push('/forms/');
  },

  removeIntegration(field) {
    dispatch(change('formForm', `${field}[enabled]`, null));
    dispatch(change('formForm', `${field}[settings][api_key]`, null));
    dispatch(change('formForm', `${field}[settings][email]`, null));
    dispatch(untouch('formForm', `${field}[enabled]`));
    dispatch(untouch('formForm', `${field}[settings][api_key]`));
    dispatch(untouch('formForm', `${field}[settings][email]`));
  },
});

FormEdit = reduxForm({
  form: 'formForm',
})(FormEdit);

export default connect(mapStateToProps, mapDispatchToProps)(FormEdit);
