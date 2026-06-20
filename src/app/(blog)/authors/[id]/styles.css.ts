import { style, globalStyle } from '@vanilla-extract/css';

const profile = style({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: 'clamp(24px, 4vw, 48px)',
  alignItems: 'center',
  padding: '40px 0 36px',
  '@media': {
    '(max-width: 620px)': {
      gridTemplateColumns: '1fr',
      gap: 20,
      paddingTop: 28,
    },
  },
});

const avatar = style({
  width: 'clamp(96px, 14vw, 124px)',
  height: 'clamp(96px, 14vw, 124px)',
  fontSize: 'clamp(42px, 6vw, 54px)',
  fontFamily: 'var(--font)',
});

const avatarImg = style({
  width: 'clamp(96px, 14vw, 124px)',
  height: 'clamp(96px, 14vw, 124px)',
  borderRadius: '50%',
  objectFit: 'cover',
  flexShrink: 0,
});

const profileText = style({ minWidth: 0 });

const eyebrow = style({
  color: 'var(--fg-3)',
  marginBottom: 14,
  display: 'inline-block',
});

const name = style({
  fontSize: 'clamp(30px, 4.4vw, 48px)',
  fontWeight: 800,
  letterSpacing: '-0.035em',
  lineHeight: 1.05,
  color: 'var(--ink)',
});

const bio = style({
  marginTop: 18,
  fontSize: 'clamp(15.5px, 1.7vw, 18px)',
  lineHeight: 1.6,
  color: 'var(--fg-2)',
  letterSpacing: '-0.01em',
  wordBreak: 'keep-all',
});

const meta = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '8px 16px',
  marginTop: 22,
  fontSize: 13.5,
  color: 'var(--fg-3)',
});

globalStyle(`${meta} b`, { color: 'var(--ink)', fontWeight: 700 });
globalStyle(`${meta} > span`, { whiteSpace: 'nowrap' });

const posts = style({ padding: '56px 0 0' });

const postgrid = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 0,
});

const empty = style({
  padding: '48px 0',
  textAlign: 'center',
  color: 'var(--fg-2)',
  fontSize: 15,
});

const styles = {
  profile,
  avatar,
  avatarImg,
  profileText,
  eyebrow,
  name,
  bio,
  meta,
  posts,
  postgrid,
  empty,
};

export default styles;
