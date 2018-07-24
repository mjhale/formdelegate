import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { fetchForms, formDeletionRequest } from 'actions/forms';
import { getOrderedForms } from 'selectors';

import Button from 'components/Button';
import FormList from 'components/Forms/FormList';

const NewFormLink = styled(Link)`
  float: right;
`;

class FormsContainer extends React.Component {
  static propTypes = {
    fetchForms: PropTypes.func.isRequired,
    formDeletionRequest: PropTypes.func.isRequired,
    forms: PropTypes.array.isRequired,
    isFetching: PropTypes.bool.isRequired,
  };

  handleFormDeletion = (formId, evt) => {
    evt.preventDefault();
    let confirm = window.confirm('Are you sure you want to delete this form?');
    if (confirm) this.props.formDeletionRequest(formId);
  };

  componentDidMount() {
    this.props.fetchForms();
  }

  render() {
    const { forms, isFetching } = this.props;

    return (
      <React.Fragment>
        <NewFormLink to="/forms/new">
          <Button tabIndex="-1">Create New Form</Button>
        </NewFormLink>
        <h1>My Forms</h1>
        <FormList
          forms={forms}
          isFetching={isFetching}
          onDeleteClick={this.handleFormDeletion}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  forms: getOrderedForms(state),
  isFetching: state.forms.isFetching,
});

const mapDispatchToProps = {
  fetchForms,
  formDeletionRequest,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FormsContainer);
