import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createForm } from 'actions/forms';
import { fetchIntegrations } from 'actions/integrations';
import { Field } from 'redux-form';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';
import Button from 'components/Button';
import Card from 'components/Card';
import FormIntegrationList from 'components/FormIntegrations/IntegrationList';

const propTypes = {
  message: PropTypes.object,
};

class FormNewContainer extends React.Component {
  componentDidMount() {
    this.props.loadIntegrationTypes();
  }

  render() {
    const { handleSubmit, integrations, submitting } = this.props;

    return (
      <div>
        <h1>Add New Form</h1>
        <form onSubmit={handleSubmit}>
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
      </div>
    );
  }
}

const mapStateToProps = state => ({
  integrations: state.entities.integrations,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadIntegrationTypes() {
    dispatch(fetchIntegrations());
  },

  onSubmit(values) {
    dispatch(createForm(values));
    ownProps.history.push('/forms/');
  },
});

FormNewContainer.propTypes = propTypes;

FormNewContainer = reduxForm({
  form: 'formForm',
})(FormNewContainer);

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(FormNewContainer)
);
