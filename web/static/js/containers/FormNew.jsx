import React, { PropTypes } from 'react';
import Form from '../components/Form';
import NewIntegrations from '../components/NewIntegrations';
import { animateScroll } from 'react-scroll';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { createForm } from '../actions/forms';
import { fetchIntegrations } from '../actions/forms';
import { Field } from 'redux-form';
import { Link } from 'react-router';
import { reduxForm } from 'redux-form';

const propTypes = {
  message: PropTypes.object,
};

class FormNewContainer extends React.Component {
  constructor() {
    super();
    this.state = { newIntegrationFields: 0 };
  }

  componentDidMount() {
    this.props.loadIntegrationTypes();
  }

  render() {
    const { handleSubmit, submitting } = this.props;
    const integrationTypes = this.props.integrations;

    return(
      <div>
        <Link
          to={null}
          className="add-integration btn"
          onClick={() => {
            this.setState({ newIntegrationFields: this.state.newIntegrationFields + 1 });
            animateScroll.scrollToBottom();
          }}
        >
          Add Integration To Form
        </Link>
        <h1>Add New Form</h1>
        <form onSubmit={handleSubmit} className="form">
          <div className="card">
            <div>
              <label>Form Name</label>
              <Field
                name="form"
                component="input"
                type="text"
              />
            </div>
            <NewIntegrations
              integrationTypes={integrationTypes}
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

const mapStateToProps = (state) => ({
  integrations: state.entities.integrations,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadIntegrationTypes() {
    dispatch(fetchIntegrations());
  },

  onSubmit(values) {
    dispatch(createForm(values));
    browserHistory.push('/forms/');
  },
});

FormNewContainer = reduxForm({
  form: 'formForm'
})(FormNewContainer);

export default connect(mapStateToProps, mapDispatchToProps)(FormNewContainer);
