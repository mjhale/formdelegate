import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { adminFetchIntegrations } from 'actions/integrations';
import { getOrderedIntegrations } from 'selectors';
import Table from 'components/Table';
import translations from 'translations';

const propTypes = {
  integrations: PropTypes.array,
  isFetching: PropTypes.bool.isRequired,
};

const defaultProps = {
  isFetching: false,
};

const integrationListColumns = [
  {
    field: 'type',
    displayName: translations['integrationlist_th_type'],
  },
  {
    field: 'edit',
    displayFn: (row, col, field) => {
      return <Link to={`/admin/integrations/${row['id']}`}>Edit</Link>;
    },
    displayName: translations['integrationlist_th_edit'],
  },
];

class AdminIntegrationList extends React.Component {
  componentDidMount() {
    const { loadIntegrations } = this.props;
    loadIntegrations();
  }

  render() {
    const { integrations, isFetching } = this.props;

    if (isFetching) return null;

    return (
      <Table
        columns={integrationListColumns}
        data={integrations}
        isFetching={isFetching}
      />
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
