import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components/macro';

import { media } from 'utils/style';

import Button from 'components/Button';
import Search from 'components/Search';
import Paginator from 'components/Paginator';

const ToolbarList = styled.ul`
  display: flex;
  justify-content: space-between;
  list-style-type: none;
  margin: 0 0 0.5rem 0;
  padding: 0;
  width: 100%;

  ${media.md`
      justify-content: normal;
      width: auto;
  `};
`;
const PaginationListItem = styled.li``;

const ReportButtonListItem = styled(Button)`
  margin-right: 0.5rem;
`;

const SearchListItem = styled.li`
  margin-right: 1rem;

  & input[name='search'] {
    line-height: 20px;
    margin: 0;
    max-width: 500px;
    padding: 6px 9px;
  }
`;

const SubmissionsToolbar = ({
  handleMarkAsHam,
  handleMarkAsSpam,
  handlePageChange,
  handleSearch,
  paginationMetaData,
}) => {
  return (
    <ToolbarList>
      <ReportButtonListItem onClick={handleMarkAsSpam}>
        Mark as Junk
      </ReportButtonListItem>
      <ReportButtonListItem onClick={handleMarkAsHam}>
        Mark as Not Junk
      </ReportButtonListItem>
      <SearchListItem>
        <Search handleSearch={handleSearch} />
      </SearchListItem>
      {paginationMetaData.total > 0 && (
        <PaginationListItem>
          <Paginator
            handlePageChange={handlePageChange}
            paginationMetaData={paginationMetaData}
          />
        </PaginationListItem>
      )}
    </ToolbarList>
  );
};

SubmissionsToolbar.propTypes = {
  handleMarkAsSpam: PropTypes.func.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  paginationMetaData: PropTypes.shape({
    limit: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
  }).isRequired,
};

export default SubmissionsToolbar;
