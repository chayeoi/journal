import { style, globalStyle } from '@vanilla-extract/css';

const root = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 24,
  flexWrap: 'wrap',
  padding: '26px 28px',
  marginTop: 32,
  borderRadius: 'var(--r-card)',
  background: 'var(--surface-2)',
});

const text = style({});

const title = style({
  fontSize: 16,
  fontWeight: 800,
  color: 'var(--ink)',
  letterSpacing: '-0.02em',
});

const desc = style({
  fontSize: 14,
  color: 'var(--fg-2)',
  lineHeight: 1.55,
  marginTop: 6,
});

const btn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  whiteSpace: 'nowrap',
  fontSize: 14,
  fontWeight: 700,
  color: '#fff',
  backgroundColor: '#161616',
  textDecoration: 'none',
  padding: '12px 20px',
  borderRadius: 'var(--r-btn)',
  transition: 'transform var(--d) var(--ease), background-color var(--d) var(--ease)',
  selectors: {
    '&:hover': {
      backgroundColor: 'var(--accent)',
      transform: 'translateY(-2px)',
    },
  },
});

globalStyle(`${btn} svg`, {
  width: 16,
  height: 16,
});

const styles = { root, text, title, desc, btn };

export default styles;
