import PropTypes from 'prop-types';

import { Box, Button, Flex } from '@chakra-ui/react';

const Paginator = ({
  handlePageChange,
  paginationMetaData: { limit, offset, total },
}) => {
  if (!total) return null;

  let currentPage = Math.ceil(offset / limit) || 1;
  let itemIndexFloor = (currentPage - 1) * limit + 1;
  let itemIndexCeiling = Math.min(itemIndexFloor + limit - 1, total);

  return (
    <Flex align="center" justify="top">
      <Box fontWeight="semibold" mr={2}>
        {itemIndexFloor}
        {'-'}
        {itemIndexCeiling} of {total}
      </Box>
      <Button
        disabled={itemIndexFloor <= 1 ? true : false}
        onClick={(evt) => handlePageChange(currentPage - 1, evt)}
        size="sm"
        mr={2}
      >
        {'<'}
      </Button>
      <Button
        disabled={itemIndexCeiling >= total ? true : false}
        onClick={(evt) => handlePageChange(currentPage + 1, evt)}
        size="sm"
      >
        {'>'}
      </Button>
    </Flex>
  );
};

Paginator.propTypes = {
  handlePageChange: PropTypes.func.isRequired,
  paginationMetaData: PropTypes.shape({
    limit: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
  }).isRequired,
};

export default Paginator;
