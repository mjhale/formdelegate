import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchIntegrations } from '../actions/integrations';
import { IntegrationList } from '../components/IntegrationList';

const propTypes = {
  integrations: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
};

class IntegrationsContainer extends React.Component {
  componentDidMount() {
    this.props.dispatch(fetchIntegrations());
  }


  render() {
    return (
      <div>
        <h2>Integrations</h2>
        <IntegrationList {...this.props} />
      </div>
    );
  }
}

IntegrationsContainer.propTypes = propTypes;

const mapStateToProps = (state) => {
  return {
    integrations: state.integrations.integrations,
    isFetching: state.integrations.isFetching,
  };
};

export default connect(mapStateToProps)(IntegrationsContainer);
