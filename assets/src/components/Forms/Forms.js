import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { fetchForms, formDeletionRequest } from 'actions/forms';
import { getOrderedForms } from 'selectors';
import Button from 'components/Button';
import FormList from 'components/Forms/FormList';

const propTypes = {
  forms: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
};

const NewFormLink = styled(Link)`
  float: right;
`;

class FormsContainer extends React.Component {
  componentDidMount() {
    this.props.loadForms();
  }

  render() {
    const { forms, isFetching, onDeleteClick } = this.props;

    return (
      <div>
        <NewFormLink to="/forms/new">
          <Button tabIndex="-1">Create New Form</Button>
        </NewFormLink>
        <h1>My Forms</h1>
        <FormList
          forms={forms}
          isFetching={isFetching}
          onDeleteClick={onDeleteClick}
        />
      </div>
    );
  }
}

FormsContainer.propTypes = propTypes;

const mapStateToProps = state => {
  return {
    forms: getOrderedForms(state),
    isFetching: state.forms.isFetching,
  };
};

const mapDispatchToProps = dispatch => ({
  loadForms() {
    dispatch(fetchForms());
  },

  onDeleteClick(formId, evt) {
    evt.preventDefault();
    let confirm = window.confirm('Are you sure you want to delete this form?');
    if (confirm) dispatch(formDeletionRequest(formId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(FormsContainer);
