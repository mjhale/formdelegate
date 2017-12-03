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
      <div>
        <div>
          <div>Integrations</div>
        </div>
        <div>
          {isEmpty &&
            !isFetching && (
              <div>
                <div>No integrations exist.</div>
              </div>
            )}
          {!isEmpty &&
            integrations.map(integration => (
              <div key={integration.id}>
                <div>
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
