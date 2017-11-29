import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { adminFetchIntegrations } from 'actions/integrations';
import { getOrderedIntegrations } from 'selectors';

const propTypes = {
  integrations: PropTypes.array,
  isFetching: PropTypes.bool.isRequired,
};

const defaultProps = {
  isFetching: false,
};

class AdminIntegrationList extends React.Component {
  componentDidMount() {
    const { loadIntegrations } = this.props;
    loadIntegrations();
  }

  render() {
    const { integrations, isFetching } = this.props;
    const isEmpty = integrations.length === 0;

    if (isFetching) return null;

    return (
      <div className="table integrations">
        <div className="table-header">
          <div className="table-cell">Integrations</div>
        </div>
        <div className="table-content">
          {isEmpty &&
            !isFetching && (
              <div className="table-row flattened">
                <div className="table-cell">No integrations exist.</div>
              </div>
            )}
          {!isEmpty &&
            integrations.map(integration => (
              <div className="table-row flattened" key={integration.id}>
                <div className="table-cell">
                  <Link to={`/admin/integrations/${integration.id}`}>
                    {integration.type}
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }
}

AdminIntegrationList.propTypes = propTypes;
AdminIntegrationList.defaultProps = defaultProps;

const mapStateToProps = state => ({
  integrations: getOrderedIntegrations(state),
  isFetching: state.integrations.isFetching,
});

const mapDispatchToProps = dispatch => ({
  loadIntegrations() {
    dispatch(adminFetchIntegrations());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  AdminIntegrationList
);
