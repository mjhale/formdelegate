import { css } from 'styled-components/macro';

export const breakpoints = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

export const media = {
  sm: (...args) => css`
    @media (min-width: ${`${breakpoints.sm}px`}) {
      ${css(...args)};
    }
  `,
  md: (...args) => css`
    @media (min-width: ${`${breakpoints.md}px`}) {
      ${css(...args)};
    }
  `,
  lg: (...args) => css`
    @media (min-width: ${`${breakpoints.lg}px`}) {
      ${css(...args)};
    }
  `,
  xl: (...args) => css`
    @media (min-width: ${`${breakpoints.xl}px`}) {
      ${css(...args)};
    }
  `,
};
