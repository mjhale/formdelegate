import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchForms } from '../actions/forms';
import { FormList } from '../components/FormList';

const propTypes = {
  forms: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
};

class FormsContainer extends React.Component {
  componentDidMount() {
    this.props.dispatch(fetchForms());
  }

  render() {
    return (
      <div className="forms">
        <a href="#" className="add-form btn">Add Form</a>
        <h1>My Forms</h1>
        <FormList {...this.props} />
      </div>
    );
  }
}

FormsContainer.propTypes = propTypes;

const mapStateToProps = (state) => {
  return {
    forms: state.forms.forms,
    isFetching: state.forms.isFetching,
  };
};

export default connect(mapStateToProps)(FormsContainer);
