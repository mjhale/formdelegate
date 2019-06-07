import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import translations from 'translations';
import { adminFetchIntegrations } from 'actions/integrations';
import { getOrderedIntegrations } from 'selectors';

import Button from 'components/Button';
import Link from 'components/Link';
import Table from 'components/Table';

const integrationListColumns = [
  {
    field: 'type',
    displayName: translations['integrationlist_th_type'],
  },
  {
    field: 'edit',
    displayFn: (row, col, field) => (
      <Button as={Link} href={`/admin/integrations/${row['id']}`}>
        Edit
      </Button>
    ),
    displayName: translations['integrationlist_th_edit'],
  },
];

class AdminIntegrationList extends React.Component {
  static propTypes = {
    adminFetchIntegrations: PropTypes.func.isRequired,
    integrations: PropTypes.array,
    isFetching: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    isFetching: false,
  };

  componentDidMount() {
    this.props.adminFetchIntegrations();
  }

  render() {
    const { integrations, isFetching } = this.props;

    if (isFetching || !integrations) return null;

    return (
      <Table
        columns={integrationListColumns}
        data={integrations}
        isFetching={isFetching}
      />
    );
  }
}

const mapStateToProps = state => ({
  integrations: getOrderedIntegrations(state),
  isFetching: state.integrations.isFetching,
});

const mapDispatchToProps = {
  adminFetchIntegrations,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminIntegrationList);
