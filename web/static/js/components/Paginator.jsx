import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';

const propTypes = {
  currentPage: PropTypes.number.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
};

const Paginator = ({ currentPage, handlePageChange, itemsPerPage, totalItems, totalPages }) => {
  if (!currentPage) return null;

  let minIndexRangeOfItems = (currentPage - 1) * itemsPerPage + 1;
  let maxIndexRangeOfItems = currentPage * itemsPerPage;
  if (maxIndexRangeOfItems > totalItems) maxIndexRangeOfItems = totalItems;

  const prevBtnClasses = classNames({
    'disabled': minIndexRangeOfItems <= 1,
    'btn': true,
  });

  const nextBtnClasses = classNames({
    'disabled': maxIndexRangeOfItems >= totalItems,
    'btn': true,
  });

  return (
    <ul className="pagination">
      <li className="status">
        {minIndexRangeOfItems}{'-'}{maxIndexRangeOfItems} of {totalItems}
      </li>
      <li>
        <Link className={prevBtnClasses} onClick={(evt) => handlePageChange(evt, currentPage - 1)}>
          {'<'}
        </Link>
      </li>
      <li>
        <Link className={nextBtnClasses} onClick={(evt) => handlePageChange(evt, currentPage + 1)}>
          {'>'}
        </Link>
      </li>
    </ul>
  );
};

Paginator.propTypes = propTypes;

export default Paginator;
