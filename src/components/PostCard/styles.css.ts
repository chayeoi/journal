import { style, globalStyle } from '@vanilla-extract/css';

const root = style({
  position: 'relative',
});

const link = style({
  display: 'flex',
  flexDirection: 'column',
  textDecoration: 'none',
  color: 'inherit',
  height: '100%',
  selectors: {
    'html[data-card="overlay"] &': {
      position: 'relative',
      borderRadius: 'var(--r-card)',
      overflow: 'hidden',
    },
    'html[data-shape="sharp"] html[data-card="overlay"] &': { borderRadius: 4 },
    'html[data-card="minimal"] &': {
      flexDirection: 'row',
      gap: 18,
      alignItems: 'stretch',
    },
    'html[data-card="list"] &': {
      flexDirection: 'row',
      gap: 32,
      alignItems: 'center',
      padding: '26px 4px',
      height: 'auto',
    },
    'html[data-thumb="off"][data-card="stacked"] &': {
      flexDirection: 'column',
      padding: '26px 24px',
    },
    'html[data-thumb="off"][data-card="minimal"] &': {
      flexDirection: 'column',
      padding: '26px 24px',
    },
    'html[data-thumb="off"][data-card="overlay"] &': {
      position: 'relative',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-card)',
      padding: '24px',
    },
    'html[data-thumb="off"][data-card="list"] &': {
      padding: '24px 4px',
    },
  },
});

globalStyle(`html[data-card="minimal"] .${link}`, {
  '@media': {
    '(max-width: 480px)': {
      flexDirection: 'column',
      gap: 14,
    },
  },
});

globalStyle(`html[data-card="list"] .${link}`, {
  '@media': {
    '(max-width: 720px)': {
      gap: 18,
      padding: '22px 2px',
      alignItems: 'flex-start',
    },
  },
});

const thumb = style({
  position: 'relative',
  display: 'block',
  borderRadius: 'var(--r-card)',
  overflow: 'hidden',
  aspectRatio: '16 / 10',
  background: 'var(--surface-2)',
  selectors: {
    'html[data-shape="sharp"] &': { borderRadius: 4 },
    'html[data-card="overlay"] &': {
      aspectRatio: '3 / 4',
      borderRadius: 0,
    },
    'html[data-card="overlay"] &::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      background:
        'linear-gradient(0deg, rgba(8,8,10,.86) 0%, rgba(8,8,10,.32) 46%, rgba(8,8,10,.04) 72%)',
    },
    'html[data-card="minimal"] &': {
      flex: '0 0 42%',
      aspectRatio: '4 / 3',
    },
    'html[data-card="list"] &': {
      order: 2,
      flex: '0 0 230px',
      alignSelf: 'stretch',
      aspectRatio: '16 / 10',
      maxHeight: 160,
    },
    'html[data-thumb="off"] &': { display: 'none' },
  },
});

globalStyle(`html[data-card="minimal"] .${thumb}`, {
  '@media': {
    '(max-width: 480px)': {
      flex: 'none',
      width: '100%',
      aspectRatio: '16 / 10',
    },
  },
});

globalStyle(`html[data-card="list"] .${thumb}`, {
  '@media': {
    '(max-width: 720px)': {
      flex: '0 0 116px',
      aspectRatio: '1 / 1',
      maxHeight: 116,
    },
  },
});

globalStyle(`${thumb} img`, {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
  transition: 'transform .5s var(--ease)',
});

globalStyle(`${link}:hover .${thumb} img`, {
  transform: 'scale(1.045)',
});

globalStyle(`html[data-card="list"] .${root}:hover .${thumb} img`, {
  transform: 'scale(1.045)',
});

const thumbCat = style({
  position: 'absolute',
  left: 12,
  top: 12,
  zIndex: 2,
  background: 'transparent',
  color: '#fff',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.02em',
  padding: 0,
  borderRadius: 0,
  backdropFilter: 'none',
});

const body = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  paddingTop: 16,
  selectors: {
    'html[data-card="overlay"] &': {
      position: 'absolute',
      inset: 'auto 0 0 0',
      zIndex: 3,
      padding: '20px',
    },
    'html[data-card="list"] &': {
      order: 1,
      paddingTop: 0,
    },
    'html[data-thumb="off"] &': { paddingTop: 0 },
    'html[data-thumb="off"][data-card="overlay"] &': {
      position: 'static',
      inset: 'auto',
      padding: 0,
    },
    'html[data-thumb="off"][data-card="list"] &': { padding: 0 },
  },
});

const kicker = style({
  display: 'none',
  color: 'var(--accent-strong)',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: 9,
  selectors: {
    'html[data-thumb="off"] &': { display: 'block' },
  },
});

const title = style({
  fontSize: 19,
  fontWeight: 700,
  lineHeight: 1.32,
  letterSpacing: '-0.02em',
  color: 'var(--ink)',
  margin: 0,
  textWrap: 'pretty',
  transition: 'color var(--d) var(--ease)',
  selectors: {
    'html[data-card="overlay"] &': { color: '#fff' },
    'html[data-card="list"] &': {
      fontSize: 22,
      lineHeight: 1.28,
    },
    'html[data-thumb="off"][data-card="overlay"] &': { color: 'var(--ink)' },
    'html[data-thumb="off"][data-card="minimal"] &': { fontSize: 19 },
  },
});

globalStyle(`html[data-card="list"] .${title}`, {
  '@media': {
    '(max-width: 720px)': {
      fontSize: 17.5,
    },
  },
});

globalStyle(`${link}:hover .${title}`, {
  color: 'var(--accent-strong)',
});

globalStyle(`html[data-card="overlay"] .${link}:hover .${title}`, {
  color: '#fff',
});

const excerpt = style({
  marginTop: 10,
  fontSize: 14,
  lineHeight: 1.6,
  color: 'var(--fg-2)',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  wordBreak: 'keep-all',
  selectors: {
    'html[data-card="overlay"] &': { color: 'rgba(255,255,255,.8)' },
    'html[data-card="list"] &': { fontSize: 14.5 },
    'html[data-thumb="off"][data-card="overlay"] &': { color: 'var(--fg-2)' },
  },
});

globalStyle(`html[data-card="list"] .${excerpt}`, {
  '@media': {
    '(max-width: 720px)': {
      display: 'none',
    },
  },
});

const tags = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  marginTop: 14,
});

const foot = style({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginTop: 'auto',
  paddingTop: 16,
  selectors: {
    'html[data-card="list"] &': {
      marginTop: 14,
      paddingTop: 0,
    },
  },
  '@media': {
    '(max-width: 620px)': {
      display: 'none',
    },
  },
});

const who = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  minWidth: 0,
});

const by = style({
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--fg)',
  selectors: {
    'html[data-card="overlay"] &': { color: '#fff' },
    'html[data-thumb="off"][data-card="overlay"] &': { color: 'var(--ink)' },
  },
});

const metaline = style({
  fontSize: 12,
  color: 'var(--fg-3)',
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  marginLeft: 'auto',
  selectors: {
    'html[data-card="overlay"] &': { color: 'rgba(255,255,255,.74)' },
    'html[data-thumb="off"][data-card="overlay"] &': { color: 'var(--fg-3)' },
  },
});

const avatarImg = style({
  width: 24,
  height: 24,
  borderRadius: '50%',
  objectFit: 'cover',
  flexShrink: 0,
});

const avatarInitial = style({
  width: 24,
  height: 24,
  fontSize: 11,
  fontWeight: 700,
});

globalStyle(`html[data-card="overlay"] .${foot} .avatar`, {
  background: 'rgba(255,255,255,.2)',
  color: '#fff',
});

globalStyle(`html[data-thumb="off"][data-card="overlay"] .${foot} .avatar`, {
  background: 'var(--ink)',
  color: '#fff',
});

const styles = {
  root,
  link,
  thumb,
  thumbCat,
  body,
  kicker,
  title,
  excerpt,
  tags,
  foot,
  who,
  by,
  metaline,
  avatarImg,
  avatarInitial,
};

export default styles;
