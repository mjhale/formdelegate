import React from 'react';
import styled from 'styled-components';
import theme from 'constants/theme';

const TableContainer = styled.div`
  --var: #fff;
`;

export const Table = styled.div`
  background: ${theme.solidWhite};
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  line-height: 1.5;
`;

export const TableHeader = styled.div`
  background: ${theme.solidWhite};
  border: 1px solid $border-color;
  border-bottom: 0;
  color: ${theme.primaryFont};
  font-size: 0.6rem;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  user-select: none;
`;

export const TableContent = styled.div`
  border: 1px solid ${theme.borderColor};
`;

export const TableRow = styled.div`
  box-shadow: inset 0 -1px 0 0 ${theme.offWhite};
  color: ${theme.mineBlack};
  display: flex;
  flex-flow: row nowrap;
  text-decoration: none;
  width: 100%;

  &:hover {
    background-color: #fafafa;
  }
`;

export const TableCell = styled.div`
  display: flex;
  flex-basis: 0;
  flex-flow: row nowrap;
  flex-grow: 1;
  font-size: 0.8rem;
  padding: 0.5rem;
`;

export default Table;
