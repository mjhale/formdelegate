import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components/macro';

import Button from 'components/Button';

const PaginationContainer = styled.ul`
  align-items: center;
  display: flex;
  justify-content: center;
  list-style-type: none;
  padding: 0;

  & li {
    display: flex;
    margin-right: 0.5rem;
  }

  & li:last-child {
    margin-right: 0;
  }
`;

const Status = styled.li`
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 20px;
`;

const Paginator = ({ handlePageChange, limit, offset, total }) => {
  if (!total) return null;

  let currentPage = Math.ceil(offset / limit) || 1;
  let itemIndexFloor = (currentPage - 1) * limit + 1;
  let itemIndexCeiling = Math.min(itemIndexFloor + limit - 1, total);

  return (
    <PaginationContainer>
      <Status>
        {itemIndexFloor}
        {'-'}
        {itemIndexCeiling} of {total}
      </Status>
      <li>
        <Button
          disabled={itemIndexFloor <= 1 ? true : false}
          onClick={evt => handlePageChange(currentPage - 1, evt)}
        >
          {'<'}
        </Button>
      </li>
      <li>
        <Button
          disabled={itemIndexCeiling >= total ? 'disabled' : false}
          onClick={evt => handlePageChange(currentPage + 1, evt)}
        >
          {'>'}
        </Button>
      </li>
    </PaginationContainer>
  );
};

Paginator.propTypes = {
  handlePageChange: PropTypes.func.isRequired,
  limit: PropTypes.number.isRequired,
  offset: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

export default Paginator;
