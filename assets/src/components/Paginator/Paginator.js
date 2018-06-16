import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from 'components/Button';

const propTypes = {
  handlePageChange: PropTypes.func.isRequired,
  limit: PropTypes.number.isRequired,
  offset: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

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
          type={itemIndexFloor <= 1 ? 'disabled' : 'default'}
          onClick={evt => handlePageChange(currentPage - 1, evt)}
        >
          {'<'}
        </Button>
      </li>
      <li>
        <Button
          onClick={evt => handlePageChange(currentPage + 1, evt)}
          type={itemIndexCeiling >= total ? 'disabled' : 'default'}
        >
          {'>'}
        </Button>
      </li>
    </PaginationContainer>
  );
};

Paginator.propTypes = propTypes;

export default Paginator;
