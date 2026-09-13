import { style, globalStyle } from '@vanilla-extract/css';

const hero = style({
  padding: 'var(--s9) 0 var(--s8)',
  borderBottom: '1px solid var(--line)',
  '@media': {
    '(max-width: 640px)': {
      padding: 'var(--s8) 0 var(--s7)',
    },
  },
});

const heroInner = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 0.45fr)',
  gap: 'var(--s7)',
  alignItems: 'end',
  '@media': {
    '(max-width: 760px)': {
      gridTemplateColumns: '1fr',
      gap: 'var(--s5)',
    },
  },
});

const heroEyebrow = style({
  gridColumn: '1 / -1',
  color: 'var(--accent)',
  marginBottom: 'calc(var(--s7) * -1)',
  '@media': {
    '(max-width: 760px)': {
      marginBottom: 'calc(var(--s3) * -1)',
    },
  },
});

const heroTitle = style({
  maxWidth: '13ch',
  fontSize: 'clamp(40px, 6vw, 72px)',
  fontWeight: 800,
  lineHeight: 1.04,
  letterSpacing: '-0.045em',
  textWrap: 'balance',
});

const heroDescription = style({
  maxWidth: '34ch',
  fontSize: 'clamp(17px, 2vw, 20px)',
  lineHeight: 1.65,
  color: 'var(--fg-2)',
  wordBreak: 'keep-all',
});

const heroNote = style({
  gridColumn: '2',
  fontSize: 'var(--fs-sm)',
  lineHeight: 1.6,
  color: 'var(--fg-3)',
  '@media': {
    '(max-width: 760px)': {
      gridColumn: '1',
    },
  },
});

const section = style({
  paddingTop: 'var(--s9)',
  paddingBottom: 'var(--s9)',
  '@media': {
    '(max-width: 640px)': {
      paddingTop: 'var(--s8)',
      paddingBottom: 'var(--s8)',
    },
  },
});

const sectionHead = style({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: 'var(--s5)',
  marginBottom: 'var(--s7)',
  paddingBottom: 'var(--s5)',
  borderBottom: '1px solid var(--line)',
  '@media': {
    '(max-width: 640px)': {
      alignItems: 'flex-start',
      flexDirection: 'column',
      marginBottom: 'var(--s6)',
    },
  },
});

const sectionTitle = style({
  marginTop: 'var(--s3)',
  fontSize: 'clamp(28px, 4vw, 40px)',
  fontWeight: 800,
  lineHeight: 1.15,
  letterSpacing: '-0.035em',
  textWrap: 'balance',
});

const sectionDescription = style({
  maxWidth: '34ch',
  fontSize: 'var(--fs-sm)',
  lineHeight: 1.6,
  color: 'var(--fg-2)',
});

const phaseGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 'var(--s4)',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  '@media': {
    '(max-width: 920px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    '(max-width: 560px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

const phaseCard = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: 330,
  padding: 'var(--s5)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--r-card)',
  background: 'var(--surface)',
  transition:
    'border-color var(--d) var(--ease), transform var(--d) var(--ease)',
  selectors: {
    '&:hover': {
      borderColor: 'var(--accent)',
      transform: 'translateY(-3px)',
    },
  },
  '@media': {
    '(max-width: 560px)': {
      minHeight: 0,
    },
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

const phaseMeta = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--s3)',
  color: 'var(--fg-3)',
});

const phaseNumber = style({
  fontSize: 'var(--fs-xs)',
  fontWeight: 700,
  fontVariantNumeric: 'tabular-nums',
  color: 'var(--accent)',
});

const phaseLabel = style({
  fontSize: 'var(--fs-xs)',
  fontWeight: 700,
  letterSpacing: '0.06em',
});

const phaseTitle = style({
  marginTop: 'var(--s6)',
  fontSize: 'var(--fs-h3)',
  fontWeight: 800,
});

const phaseDescription = style({
  marginTop: 'var(--s4)',
  fontSize: 'var(--fs-sm)',
  lineHeight: 1.7,
  color: 'var(--fg-2)',
  wordBreak: 'keep-all',
});

const linkRow = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 'var(--s2)',
  marginTop: 'auto',
  paddingTop: 'var(--s5)',
});

const textLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--s2)',
  minHeight: 32,
  fontSize: 'var(--fs-sm)',
  fontWeight: 700,
  color: 'var(--ink)',
  textUnderlineOffset: 4,
  selectors: {
    '&:hover': {
      color: 'var(--accent-strong)',
      textDecoration: 'underline',
    },
    '&:focus-visible': {
      outline: '3px solid var(--accent-ring)',
      outlineOffset: 3,
      borderRadius: 'var(--r-btn)',
    },
  },
});

const entranceSection = style({
  padding: 'var(--s9) 0',
  background: 'var(--surface-2)',
  borderTop: '1px solid var(--line-2)',
  borderBottom: '1px solid var(--line-2)',
  '@media': {
    '(max-width: 640px)': {
      padding: 'var(--s8) 0',
    },
  },
});

const entranceGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 'var(--s4)',
  '@media': {
    '(max-width: 760px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

const entranceCard = style({
  display: 'flex',
  flexDirection: 'column',
  padding: 'var(--s6)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--r-card)',
  background: 'var(--surface)',
});

const entranceTitle = style({
  fontSize: 'var(--fs-h2)',
  fontWeight: 800,
});

const entranceDescription = style({
  marginTop: 'var(--s4)',
  fontSize: 'var(--fs-sm)',
  lineHeight: 1.7,
  color: 'var(--fg-2)',
  wordBreak: 'keep-all',
});

const chipList = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--s2)',
  marginTop: 'var(--s6)',
});

const chipLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 40,
  padding: 'var(--s2) var(--s4)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--r-chip)',
  background: 'var(--surface)',
  fontSize: 'var(--fs-sm)',
  fontWeight: 700,
  color: 'var(--ink)',
  transition:
    'background var(--d) var(--ease), color var(--d) var(--ease), border-color var(--d) var(--ease)',
  selectors: {
    '&:hover': {
      borderColor: 'var(--ink)',
      background: 'var(--ink)',
      color: 'var(--white)',
    },
    '&:focus-visible': {
      outline: '3px solid var(--accent-ring)',
      outlineOffset: 2,
    },
  },
});

const articleSection = style({
  paddingTop: 'var(--s9)',
  paddingBottom: 'var(--s9)',
  '@media': {
    '(max-width: 640px)': {
      paddingTop: 'var(--s8)',
      paddingBottom: 'var(--s8)',
    },
  },
});

const allLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--s2)',
  minHeight: 40,
  fontSize: 'var(--fs-sm)',
  fontWeight: 700,
  color: 'var(--ink)',
  selectors: {
    '&:hover': { color: 'var(--accent-strong)' },
    '&:focus-visible': {
      outline: '3px solid var(--accent-ring)',
      outlineOffset: 3,
      borderRadius: 'var(--r-btn)',
    },
  },
});

const postList = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  columnGap: 'var(--s7)',
  selectors: {
    'html[data-card="list"] &': {
      gridTemplateColumns: '1fr',
    },
  },
  '@media': {
    '(max-width: 760px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

globalStyle(`html[data-card="list"] .${postList} > article`, {
  borderBottom: '1px solid var(--line)',
});

const empty = style({
  padding: 'var(--s8) 0',
  textAlign: 'center',
  fontSize: 'var(--fs-body)',
  color: 'var(--fg-2)',
});

const styles = {
  hero,
  heroInner,
  heroEyebrow,
  heroTitle,
  heroDescription,
  heroNote,
  section,
  sectionHead,
  sectionTitle,
  sectionDescription,
  phaseGrid,
  phaseCard,
  phaseMeta,
  phaseNumber,
  phaseLabel,
  phaseTitle,
  phaseDescription,
  linkRow,
  textLink,
  entranceSection,
  entranceGrid,
  entranceCard,
  entranceTitle,
  entranceDescription,
  chipList,
  chipLink,
  articleSection,
  allLink,
  postList,
  empty,
};

export default styles;
