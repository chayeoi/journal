import { style, globalStyle } from '@vanilla-extract/css';

const root = style({
  marginTop: 96,
  background: 'var(--surface-2)',
});

const inner = style({
  maxWidth: 'var(--wrap)',
  margin: '0 auto',
  padding: '64px 32px 48px',
  '@media': {
    '(max-width: 640px)': {
      padding: '48px 20px 40px',
    },
  },
});

const grid = style({
  display: 'grid',
  gridTemplateColumns: '1.4fr 1fr 1fr',
  gap: 48,
  '@media': {
    '(max-width: 760px)': {
      gridTemplateColumns: '1fr',
      gap: 36,
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
  marginBottom: 16,
  selectors: {
    '&:hover': { color: 'var(--accent)' },
  },
});

const about = style({
  fontSize: 14,
  lineHeight: 1.65,
  color: 'var(--fg-2)',
});

const quote = style({
  marginTop: 20,
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--ink)',
  letterSpacing: '-0.01em',
});

const col = style({});

globalStyle(`${col} h4`, {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--fg-3)',
  marginBottom: 16,
});

const contact = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 11,
});

globalStyle(`${contact} a, ${contact} span`, {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 10,
  fontSize: 14,
  color: 'var(--fg-2)',
  textDecoration: 'none',
  lineHeight: 1.5,
});

globalStyle(`${contact} a:hover`, {
  color: 'var(--accent)',
});

globalStyle(`${contact} svg`, {
  width: 16,
  height: 16,
  flex: '0 0 auto',
  marginTop: 2,
  color: 'var(--n-07)',
});

const bottom = style({
  maxWidth: 'var(--wrap)',
  margin: '0 auto',
  padding: '22px 32px',
  borderTop: '1px solid var(--line)',
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
  fontSize: 12.5,
  color: 'var(--fg-3)',
  '@media': {
    '(max-width: 640px)': {
      padding: '22px 20px',
    },
  },
});

globalStyle(`${bottom} a`, {
  color: 'var(--fg-3)',
  textDecoration: 'none',
});

globalStyle(`${bottom} a:hover`, {
  color: 'var(--accent)',
});

const styles = { root, inner, grid, brand, about, quote, col, contact, bottom };

export default styles;
