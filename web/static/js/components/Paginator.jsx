import React, { PropTypes } from 'react';
import classNames from 'classnames';

const propTypes = {
  handlePageChange: PropTypes.func.isRequired,
  limit: PropTypes.number.isRequired,
  offset: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

const Paginator = ({ handlePageChange, limit, offset, total }) => {
  if (!total) return null;

  let currentPage = Math.ceil(offset / limit) || 1;
  let itemIndexCeiling = offset + limit <= total ? offset + limit : total;
  let itemIndexFloor = offset || 1;

  const prevBtnClasses = classNames({
    disabled: itemIndexFloor <= 1,
    btn: true,
  });

  const nextBtnClasses = classNames({
    disabled: itemIndexCeiling >= total,
    btn: true,
  });

  return (
    <ul className="pagination">
      <li className="status">
        {itemIndexFloor}
        {'-'}
        {itemIndexCeiling} of {total}
      </li>
      <li>
        <a
          className={prevBtnClasses}
          onClick={evt => handlePageChange(currentPage - 1, evt)}
        >
          {'<'}
        </a>
      </li>
      <li>
        <a
          className={nextBtnClasses}
          onClick={evt => handlePageChange(currentPage + 1, evt)}
        >
          {'>'}
        </a>
      </li>
    </ul>
  );
};

Paginator.propTypes = propTypes;

export default Paginator;
