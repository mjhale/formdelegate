import React, { PropTypes } from 'react';
import { animateScroll } from 'react-scroll';
import { browserHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import { fetchForm, fetchIntegrations, updateForm } from '../actions/forms';
import { Field } from 'redux-form';
import { findLastIndex } from 'lodash';
import { formSchema } from '../schema';
import { getForm } from '../selectors';
import { reduxForm } from 'redux-form';
import FormIntegrationList from '../components/FormIntegrationList';
import NewIntegrations from '../components/NewIntegrations';

const propTypes = {
  initialValues: PropTypes.object,
  isFetching: PropTypes.bool.isRequired,
};

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
      lastFormIntegrationId,
      newIntegrationFields,
      submitting,
    } = this.props;
    const integrationTypes = this.props.integrations;

    if (isFetching || !formData) {
      return (
        <div>Loading form...</div>
      );
    }

    return (
      <div>
        <a
          className="btn add-integration"
          onClick={() => {
            this.setState({ newIntegrationFields: this.state.newIntegrationFields + 1 });
            animateScroll.scrollToBottom();
          }}
        >
          Add Integration To Form
        </a>
        <h1>Edit Form</h1>
        <form onSubmit={handleSubmit} className="form">
          <div className="header">
            <div className="verified">
              {(formData.verified) ? 'Verified' : 'Unverified'}
            </div>
            {formData.form}
          </div>
          <div className="card">
            <div>
              <label>Form Name</label>
              <Field
                name="form"
                component="input"
                type="text"
              />
            </div>
            <div>
              <label>Form ID</label>
              <Field
                name="id"
                component="input"
                type="text"
                disabled
              />
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
            <FormIntegrationList integrations={formData.form_integrations} />
            <NewIntegrations
              integrationTypes={integrationTypes}
              lastFormIntegrationId={lastFormIntegrationId}
              newIntegrationFields={this.state.newIntegrationFields}
            />
          </div>
          <div>
            <button type="submit" className="btn" disabled={submitting}>Save Form</button>
          </div>
        </form>
      </div>
    );
  }
}

FormEdit.propTypes = propTypes;

const mapStateToProps = (state, ownProps) => {
  const denormalizedForm = (state.entities.forms)
    ? denormalize(ownProps.match.params.formId, formSchema, state.entities)
    : null;

  return {
    formData: denormalizedForm,
    initialValues: denormalizedForm, /* initialize redux form values */
    integrations: state.entities.integrations,
    isFetching: state.forms.isFetching,
    lastFormIntegrationId: (denormalizedForm) ? findLastIndex(denormalizedForm.form_integrations) : 0,
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
});

FormEdit = reduxForm({
  form: 'formForm',
})(FormEdit);

export default connect(mapStateToProps, mapDispatchToProps)(FormEdit);
