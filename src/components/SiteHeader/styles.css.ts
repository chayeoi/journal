import { style, globalStyle } from '@vanilla-extract/css';

const root = style({
  position: 'sticky',
  top: 0,
  zIndex: 50,
  background: 'var(--bg)',
  transition: 'transform var(--d) var(--ease)',
  willChange: 'transform',
  selectors: {
    '&[data-hidden="true"]': {
      transform: 'translateY(-100%)',
    },
  },
});

const inner = style({
  height: 'var(--headerH)',
  display: 'flex',
  alignItems: 'center',
  gap: 28,
  maxWidth: 'var(--wrap)',
  margin: '0 auto',
  padding: '0 32px',
  '@media': {
    '(max-width: 640px)': {
      padding: '0 20px',
      gap: 16,
    },
  },
});

const brand = style({
  display: 'inline-flex',
  alignItems: 'center',
  fontWeight: 800,
  fontSize: 21,
  letterSpacing: '0.01em',
  textDecoration: 'none',
  color: 'var(--ink)',
  transition: 'color var(--d) var(--ease)',
  selectors: {
    '&:hover': { color: 'var(--accent)' },
  },
});

const spacer = style({
  flex: 1,
});

const cta = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--fg-2)',
  textDecoration: 'none',
  selectors: {
    '&:hover': { color: 'var(--accent)' },
  },
});

globalStyle(`${cta} svg`, {
  width: 15,
  height: 15,
});

globalStyle(`${cta} span`, {
  '@media': {
    '(max-width: 520px)': {
      display: 'none',
    },
  },
});

const styles = { root, inner, brand, spacer, cta };

export default styles;
