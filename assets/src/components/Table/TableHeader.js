import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components/macro';

import theme from 'constants/theme';

const TableHeaderContainer = styled.thead`
  background: ${theme.borderColor};
`;

const TableHeaderRow = styled.tr``;

const TableHeaderCell = styled.th`
  font-family: ${theme.primaryFont};
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.5rem;
  text-transform: uppercase;
  user-select: none;

  &:first-of-type {
    text-align: left;
  }
`;

const TableHeader = ({ columns }) => (
  <TableHeaderContainer>
    <TableHeaderRow>
      {columns.map((column, index) => (
        <TableHeaderCell key={index} column={column}>
          {column.displayName}
        </TableHeaderCell>
      ))}
    </TableHeaderRow>
  </TableHeaderContainer>
);

TableHeader.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({})),
};

export default TableHeader;
