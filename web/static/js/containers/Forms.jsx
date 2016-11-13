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
    return <FormList {...this.props} />;
  }
}

FormsContainer.propTypes = propTypes;

const mapStateToProps = (state) => {
  return {
    forms: state.forms.forms,
    isFetching: state.messages.isFetching,
  };
};

export default connect(mapStateToProps)(FormsContainer);
