import PropTypes from 'prop-types';
import styled from 'styled-components';
import { shade } from 'polished';

const typeColors = {
  alert: '#fff6bf',
  error: '#fbe3e4',
  notice: '#e5edf8',
  success: '#e6efc2',
};

const Flash = styled.div`
  background-color: ${props => typeColors[props.type]};
  color: ${props => props.typeColor && shade(0.6, typeColors[props.type])};
  display: block;
  padding: 0.75em;
  text-align: center;

  & > :first-child {
    color: ${props => props.typeColor && shade(0.7, typeColors[props.type])};
    text-decoration: underline;

    &:focus,
    &:hover {
      color: ${props => props.typeColor && shade(0.9, typeColors[props.type])};
    }
  }
`;

Flash.propTypes = {
  type: PropTypes.oneOf(['alert', 'error', 'notice', 'success']),
};

Flash.defaultProps = {
  type: 'notice',
};

export default Flash;
