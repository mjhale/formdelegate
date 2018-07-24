import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';

import { createForm } from 'actions/forms';
import { fetchIntegrations } from 'actions/integrations';

import Button from 'components/Button';
import Card from 'components/Card';
import FormIntegrationList from 'components/FormIntegrations/IntegrationList';

class FormNewContainer extends React.Component {
  static propTypes = {
    createForm: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    message: PropTypes.object,
  };

  handleFormSubmission = form => {
    const { createForm, history } = this.props;

    createForm(form).then(() => history.push('/forms/'));
  };

  componentDidMount() {
    this.props.fetchIntegrations();
  }

  render() {
    const { handleSubmit, integrations, submitting } = this.props;

    return (
      <React.Fragment>
        <h1>Add New Form</h1>
        <form onSubmit={handleSubmit(this.handleFormSubmission)}>
          <Card>
            <div>
              <label>Form Name</label>
              <Field name="form" component="input" type="text" />
            </div>
            <FormIntegrationList integrationTypes={integrations} />
          </Card>
          <Button type="submit" disabled={submitting}>
            Save Form
          </Button>
        </form>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  integrations: state.entities.integrations,
});

const mapDispatchToProps = {
  createForm,
  fetchIntegrations,
};

FormNewContainer = reduxForm({
  form: 'formForm',
})(FormNewContainer);

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FormNewContainer)
);
