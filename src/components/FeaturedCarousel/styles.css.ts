import { style, globalStyle } from '@vanilla-extract/css';

const root = style({
  position: 'relative',
  marginTop: 30,
  borderRadius: 'var(--r-card)',
  overflow: 'hidden',
  background: '#0c0c0e',
  aspectRatio: '16 / 7',
  boxShadow: 'var(--sh-2)',
  selectors: {
    'html[data-shape="sharp"] &': { borderRadius: 4 },
    'html[data-carousel="split"] &': {
      background: 'var(--surface)',
      aspectRatio: '16 / 6.4',
    },
  },
  '@media': {
    '(max-width: 720px)': {
      aspectRatio: '16 / 9',
      marginTop: 22,
    },
  },
});

globalStyle(`html[data-carousel="split"] .${root}`, {
  '@media': {
    '(max-width: 720px)': {
      aspectRatio: '4 / 5',
    },
  },
});

const track = style({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  transition: 'transform .55s var(--ease)',
  willChange: 'transform',
});

const slide = style({
  position: 'relative',
  flex: '0 0 100%',
  width: '100%',
  height: '100%',
  display: 'block',
  textDecoration: 'none',
  color: '#fff',
  selectors: {
    'html[data-carousel="split"] &': {
      display: 'grid',
      gridTemplateColumns: '1.08fr .92fr',
    },
  },
});

globalStyle(`html[data-carousel="split"] .${slide}`, {
  '@media': {
    '(max-width: 720px)': {
      gridTemplateColumns: '1fr',
      gridTemplateRows: '1.1fr 1fr',
    },
  },
});

const slideMedia = style({
  position: 'absolute',
  inset: 0,
  selectors: {
    'html[data-carousel="split"] &': { position: 'relative' },
  },
});

globalStyle(`${slideMedia} img`, {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
});

const slideShade = style({
  position: 'absolute',
  inset: 0,
  background: `
    linear-gradient(90deg, rgba(8,8,10,.82) 0%, rgba(8,8,10,.5) 44%, rgba(8,8,10,.04) 78%),
    linear-gradient(0deg, rgba(8,8,10,.6) 0%, rgba(8,8,10,0) 52%)
  `,
  selectors: {
    'html[data-carousel="split"] &': { display: 'none' },
  },
});

const slideInner = style({
  position: 'absolute',
  left: 0,
  bottom: 0,
  zIndex: 2,
  padding: 'clamp(26px, 4vw, 52px)',
  paddingLeft: 'clamp(70px, 6vw, 88px)',
  paddingRight: 64,
  maxWidth: 'calc(100% - 80px)',
  width: '100%',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  selectors: {
    'html[data-carousel="split"] &': {
      position: 'relative',
      color: 'var(--ink)',
      justifyContent: 'center',
      background: 'var(--bg)',
      maxWidth: 'none',
      padding: 'clamp(26px, 3.4vw, 56px)',
      paddingLeft: 'clamp(26px, 3.4vw, 56px)',
    },
  },
  '@media': {
    '(max-width: 720px)': {
      padding: '26px 22px 24px',
      paddingLeft: 22,
      paddingRight: 22,
    },
  },
});

const slideCat = style({
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#fff',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 14,
  selectors: {
    '&::before': {
      content: '""',
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: 'var(--accent)',
    },
    'html[data-carousel="split"] &': { color: 'var(--accent)' },
  },
});

const slideTitle = style({
  fontSize: 'clamp(16px, 3.1vw, 42px)',
  fontWeight: 800,
  letterSpacing: '-0.03em',
  lineHeight: 1.12,
  textWrap: 'balance',
  wordBreak: 'keep-all',
  selectors: {
    'html[data-carousel="split"] &': { color: 'var(--ink)' },
  },
});

const slideExcerpt = style({
  marginTop: 14,
  fontSize: 'clamp(14px, 1.4vw, 16.5px)',
  lineHeight: 1.6,
  color: 'rgba(255,255,255,.82)',
  maxWidth: '54ch',
  wordBreak: 'keep-all',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  selectors: {
    'html[data-carousel="split"] &': { color: 'var(--fg-2)' },
  },
  '@media': {
    '(max-width: 720px)': {
      WebkitLineClamp: 2,
      whiteSpace: 'normal',
      wordBreak: 'keep-all',
    },
  },
});

const slideMeta = style({
  marginTop: 22,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontSize: 13.5,
  color: 'rgba(255,255,255,.92)',
  selectors: {
    'html[data-carousel="split"] &': { color: 'var(--fg-2)' },
  },
});

globalStyle(`${slideMeta} .avatar`, {
  background: 'rgba(255,255,255,.18)',
  color: '#fff',
});

globalStyle(`html[data-carousel="split"] .${slideMeta} .avatar`, {
  background: 'var(--ink)',
});

const arrow = style({
  position: 'absolute',
  top: '50%',
  zIndex: 6,
  width: 44,
  height: 44,
  borderRadius: '50%',
  background: 'rgba(255,255,255,.13)',
  border: '1px solid rgba(255,255,255,.28)',
  color: '#fff',
  display: 'grid',
  placeItems: 'center',
  cursor: 'pointer',
  backdropFilter: 'blur(6px)',
  transition: 'background var(--d) var(--ease)',
  selectors: {
    '&:hover': { background: 'rgba(255,255,255,.3)' },
    'html[data-carousel="split"] &': {
      background: 'rgba(0,0,0,.06)',
      borderColor: 'var(--line)',
      color: 'var(--ink)',
    },
  },
  '@media': {
    '(max-width: 720px)': {
      display: 'none',
      width: 38,
      height: 38,
    },
  },
});

globalStyle(`html[data-carousel="split"] .${arrow}:hover`, {
  background: 'rgba(0,0,0,.12)',
});

globalStyle(`${arrow} svg`, {
  width: 22,
  height: 22,
});

const arrowPrev = style({
  left: 16,
  transform: 'translateY(-50%) rotate(90deg)',
  '@media': {
    '(max-width: 720px)': { left: 10 },
  },
});

const arrowNext = style({
  right: 16,
  transform: 'translateY(-50%) rotate(-90deg)',
  '@media': {
    '(max-width: 720px)': { right: 10 },
  },
});

const dots = style({
  position: 'absolute',
  bottom: 16,
  right: 'clamp(18px, 4vw, 38px)',
  zIndex: 6,
  display: 'flex',
  gap: 8,
});

const dot = style({
  width: 9,
  height: 9,
  padding: 0,
  border: 'none',
  borderRadius: 999,
  background: 'rgba(255,255,255,.42)',
  cursor: 'pointer',
  transition: 'width var(--d) var(--ease), background var(--d) var(--ease)',
});

const dotActive = style({
  background: '#fff',
  width: 26,
});

globalStyle(`html[data-carousel="split"] .${dots} .${dot}`, {
  background: 'rgba(0,0,0,.22)',
});

globalStyle(`html[data-carousel="split"] .${dots} .${dotActive}`, {
  background: 'var(--ink)',
});

const slideAvatar = style({
  width: 30,
  height: 30,
  borderRadius: '50%',
  objectFit: 'cover',
  flexShrink: 0,
});

const avatarInitial = style({
  width: 30,
  height: 30,
  fontSize: 13,
  fontWeight: 700,
});

const styles = {
  root,
  track,
  slide,
  slideMedia,
  slideShade,
  slideInner,
  slideCat,
  slideTitle,
  slideExcerpt,
  slideMeta,
  arrow,
  arrowPrev,
  arrowNext,
  dots,
  dot,
  dotActive,
  slideAvatar,
  avatarInitial,
};

export default styles;
