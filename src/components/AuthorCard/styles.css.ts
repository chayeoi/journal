import { style, globalStyle } from '@vanilla-extract/css';

const root = style({
  position: 'relative',
  selectors: {
    'html[data-acard="plain"] &': { borderBottom: '1px solid var(--line-2)' },
  },
});

const link = style({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  alignItems: 'center',
  gap: 'clamp(16px, 3vw, 32px)',
  textDecoration: 'none',
  color: 'inherit',
  padding: '26px 16px',
  borderRadius: 'var(--r-card)',
  border: '1px solid transparent',
  transition:
    'background var(--d) var(--ease), border-color var(--d) var(--ease), box-shadow var(--d) var(--ease), transform var(--d) var(--ease)',
  selectors: {
    'html[data-shape="sharp"] &': { borderRadius: 4 },
    'html[data-acard="plain"] &': { borderRadius: 0 },
    'html[data-acard="plain"] &:hover': { background: 'var(--surface-2)' },
    'html[data-acard="filled"] &': { background: 'var(--surface-2)' },
    'html[data-acard="filled"] &:hover': { background: 'var(--n-02)' },
    'html[data-acard="border"] &': { borderColor: 'var(--line)' },
    'html[data-acard="border"] &:hover': { borderColor: 'var(--ink)' },
    'html[data-acard="shadow"] &': {
      boxShadow:
        '0 1px 2px rgba(0,0,0,0.03), 0 12px 28px -14px rgba(0,0,0,0.16)',
    },
    'html[data-acard="shadow"] &:hover': {
      boxShadow:
        '0 2px 4px rgba(0,0,0,0.04), 0 20px 40px -18px rgba(0,0,0,0.2)',
      transform: 'translateY(-2px)',
    },
  },
});

globalStyle(`html[data-card="list"] .${link}`, {
  '@media': {
    '(max-width: 560px)': {
      padding: '22px 12px',
    },
  },
});

const avatarImg = style({
  width: 60,
  height: 60,
  borderRadius: '50%',
  objectFit: 'cover',
  flexShrink: 0,
});

const avatarInitial = style({
  width: 60,
  height: 60,
  fontSize: 25,
  fontWeight: 700,
  fontFamily: 'var(--font)',
});

globalStyle(
  `html[data-card="list"] .${avatarImg}, html[data-card="list"] .${avatarInitial}`,
  {
    '@media': {
      '(max-width: 560px)': {
        width: 48,
        height: 48,
      },
    },
  },
);

const main = style({ minWidth: 0 });

const name = style({
  position: 'relative',
  display: 'inline',
  fontSize: 20,
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: 'var(--ink)',
  backgroundImage: 'linear-gradient(var(--ink), var(--ink))',
  backgroundSize: '0% 1px',
  backgroundPosition: '0 100%',
  backgroundRepeat: 'no-repeat',
  transition: 'background-size var(--d) var(--ease)',
});

globalStyle(`.${link}:hover .${name}`, {
  backgroundSize: '100% 1px',
});

const bio = style({
  marginTop: 6,
  fontSize: 14.5,
  lineHeight: 1.6,
  color: 'var(--fg-2)',
  wordBreak: 'keep-all',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

const go = style({
  display: 'inline-flex',
  color: 'var(--n-06)',
  transition: 'transform var(--d) var(--ease), color var(--d) var(--ease)',
});

globalStyle(`.${go} svg`, { width: 20, height: 20 });

globalStyle(`.${link}:hover .${go}`, {
  transform: 'translateX(4px)',
  color: 'var(--ink)',
});

const styles = { root, link, avatarImg, avatarInitial, main, name, bio, go };

export default styles;
