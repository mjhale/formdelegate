import React, { PropTypes } from 'react';
import Form from '../components/Form';
import { animateScroll } from 'react-scroll';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import { fetchForm, fetchIntegrations, updateForm } from '../actions/forms';
import { findLastIndex } from 'lodash';
import { formSchema } from '../schema';
import { getForm } from '../selectors';
import { Link } from 'react-router';
import { reduxForm } from 'redux-form';

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
    const { formData, isFetching, lastFormIntegrationId, newIntegrationFields } = this.props;
    const integrationTypes = this.props.integrations;

    if (isFetching) {
      return (
        <div>Loading form...</div>
      );
    }

    return (
      <div>
        <Link
          to={null}
          className="btn add-integration"
          onClick={() => {
            this.setState({ newIntegrationFields: this.state.newIntegrationFields + 1 });
            animateScroll.scrollToBottom();
          }}
        >
          Add Integration To Form
        </Link>
        <h1>Edit Form</h1>
        <Form
          {...this.props}
          form={formData}
          newIntegrationFields={this.state.newIntegrationFields}
          integrationTypes={integrationTypes}
          lastFormIntegrationId={lastFormIntegrationId}
        />
      </div>
    );
  }
}

FormEdit.propTypes = propTypes;

const mapStateToProps = (state, ownProps) => {
  const denormalizedForm = (state.entities.forms)
    ? denormalize(ownProps.params.formId, formSchema, state.entities)
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
    dispatch(fetchForm(ownProps.params.formId));
  },

  loadIntegrationTypes() {
    dispatch(fetchIntegrations());
  },

  onSubmit(values) {
    dispatch(updateForm(values));
    browserHistory.push(`/forms/`);
  }
});

FormEdit = reduxForm({
  form: 'formForm'
})(FormEdit);

export default connect(mapStateToProps, mapDispatchToProps)(FormEdit);
