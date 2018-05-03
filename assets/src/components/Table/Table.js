import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import theme from 'constants/theme';
import TableHeader from 'components/Table/TableHeader';

export const TableContainer = styled.table`
  background: ${theme.solidWhite};
  border: 1px solid ${theme.borderColor};
  line-height: 1.5;
  width: 100%;
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  box-shadow: inset 0 -1px 0 0 ${theme.offWhite};
  color: ${theme.mineBlack};
  text-decoration: none;
  width: 100%;

  &:hover {
    background-color: #fafafa;
  }
`;

export const TableCell = styled.td`
  font-size: 0.8rem;
  padding: 0.5rem;

  &:not(:first-of-type) {
    text-align: center;
  }
`;

class Table extends React.Component {
  render() {
    const {
      columns,
      data,
      dataEmptyPlaceholder,
      error,
      isFetching,
    } = this.props;
    const isEmpty = data.length === 0;

    if (isFetching) {
      return <div>Loading...</div>;
    }

    if (!isFetching && error) {
      return <div>Error...</div>;
    }

    if (!isFetching && !error && isEmpty) {
      return <div>{dataEmptyPlaceholder}</div>;
    }

    return (
      <TableContainer>
        <TableHeader columns={columns} />
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, columnIndex) => {
                const { displayFn, field } = column;
                let value = row[field];

                if (displayFn) {
                  value = displayFn(row, column, field);
                }

                return (
                  <TableCell key={`${rowIndex}-${columnIndex}`}>
                    {value}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    );
  }
}

Table.defaultProps = {
  dataEmptyPlaceholder: 'No items found',
  error: false,
  loading: true,
};

Table.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({})),
  data: PropTypes.arrayOf(PropTypes.shape({})),
  dataEmptyPlaceholder: PropTypes.string,
  error: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default Table;
