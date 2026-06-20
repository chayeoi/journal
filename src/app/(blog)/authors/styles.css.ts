import { style, globalStyle } from '@vanilla-extract/css';

const head = style({
  paddingBottom: 36,
  borderBottom: 'none',
});

globalStyle(`.${head} p`, {
  maxWidth: 'none',
});

const eyebrow = style({
  display: 'inline-block',
  marginBottom: 14,
});

const list = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '32px 0 8px',
  selectors: {
    'html[data-acard="filled"] &': { gap: 12 },
    'html[data-acard="border"] &': { gap: 12 },
    'html[data-acard="shadow"] &': { gap: 14 },
  },
});

const empty = style({
  padding: '80px 0',
  textAlign: 'center',
});

globalStyle(`.${empty} h3`, {
  fontSize: 20,
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: 'var(--ink)',
});

globalStyle(`.${empty} p`, {
  marginTop: 10,
  fontSize: 15,
  color: 'var(--fg-2)',
});

const styles = { head, eyebrow, list, empty };

export default styles;
