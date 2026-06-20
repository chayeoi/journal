import { style, globalStyle } from '@vanilla-extract/css';

/* ── 리스트 레이아웃 ── */
const listBody = style({
  display: 'grid',
  gap: 48,
  padding: '40px 0 0',
  alignItems: 'start',
  selectors: {
    'html[data-filter="rail"] &': { gridTemplateColumns: '260px 1fr' },
    'html[data-filter="bar"] &': { gridTemplateColumns: '1fr' },
  },
});

/* ── 필터 사이드바 ── */
const filters = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 26,
  selectors: {
    'html[data-filter="rail"] &': {
      position: 'sticky',
      top: 'calc(var(--headerH) + 24px)',
    },
    'html[data-filter="bar"] &': {
      display: 'grid',
      gridTemplateColumns: 'minmax(220px, 1fr) auto',
      gap: '16px 24px',
      alignItems: 'center',
      padding: '22px 24px',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-card)',
      background: 'var(--surface-2)',
    },
  },
});

/* ── 검색 ── */
const fsearch = style({
  position: 'relative',
});

globalStyle(`${fsearch} input`, {
  width: '100%',
  height: 46,
  padding: '0 16px 0 44px',
  fontFamily: 'var(--font)',
  fontSize: 15,
  color: 'var(--fg)',
  background: 'var(--surface)',
  border: '1.5px solid var(--n-04)',
  borderRadius: 'var(--r-input)',
  transition:
    'border-color var(--d) var(--ease), box-shadow var(--d) var(--ease)',
});

globalStyle(`${fsearch} input:focus`, {
  outline: 'none',
  borderColor: 'var(--accent)',
  boxShadow: '0 0 0 4px var(--accent-ring)',
});

globalStyle(`${fsearch} input::placeholder`, {
  color: 'var(--n-06)',
});

globalStyle(`${fsearch} svg`, {
  position: 'absolute',
  left: 16,
  top: '50%',
  transform: 'translateY(-50%)',
  width: 18,
  height: 18,
  color: 'var(--n-07)',
  pointerEvents: 'none',
});

/* ── 필터 그룹 ── */
const fgroupLabel = style({
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--fg-3)',
  marginBottom: 12,
});

globalStyle(`html[data-filter="bar"] .${fgroupLabel}`, {
  display: 'none',
});

/* ── 카테고리 버튼 목록 ── */
const fcat = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  selectors: {
    'html[data-filter="rail"] &': {
      maxHeight: 210,
      overflowY: 'auto',
      paddingRight: 2,
      scrollbarWidth: 'thin',
      scrollbarColor: 'var(--n-04) transparent',
    },
    'html[data-filter="bar"] &': {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 7,
    },
  },
});

globalStyle(`html[data-filter="rail"] .${fcat}::-webkit-scrollbar`, {
  width: 8,
});

globalStyle(`html[data-filter="rail"] .${fcat}::-webkit-scrollbar-thumb`, {
  background: 'var(--n-04)',
  borderRadius: 4,
  border: '2px solid transparent',
  backgroundClip: 'content-box',
});

globalStyle(`html[data-filter="rail"] .${listBody}`, {
  '@media': {
    '(max-width: 860px)': {
      gridTemplateColumns: 'minmax(0, 1fr)',
      gap: 28,
      paddingTop: 28,
    },
  },
});

globalStyle(`html[data-filter="rail"] .${filters}`, {
  '@media': {
    '(max-width: 860px)': {
      position: 'static',
      gap: 18,
    },
  },
});

globalStyle(`html[data-filter="rail"] .${fcat}`, {
  '@media': {
    '(max-width: 860px)': {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      gap: 8,
      overflowX: 'auto',
      maxHeight: 'none',
      overflowY: 'visible',
      paddingRight: 0,
      margin: '0 -20px',
      padding: '0 20px 4px',
      scrollbarWidth: 'none',
      WebkitOverflowScrolling: 'touch',
    },
  },
});

const fcatBtn = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
  width: '100%',
  appearance: 'none',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--font)',
  fontSize: 14.5,
  fontWeight: 600,
  color: 'var(--fg-2)',
  padding: '9px 12px',
  borderRadius: 'var(--r-btn)',
  textAlign: 'left',
  transition: 'background var(--d) var(--ease), color var(--d) var(--ease)',
  selectors: {
    '&:hover': { background: 'var(--surface-2)', color: 'var(--ink)' },
    '&[aria-pressed="true"]': { background: 'var(--ink)', color: '#fff' },
    'html[data-filter="bar"] &': {
      width: 'auto',
      border: '1px solid var(--line)',
      borderRadius: 999,
      padding: '8px 16px',
      background: 'var(--surface)',
    },
    'html[data-filter="bar"] &[aria-pressed="true"]': {
      background: 'var(--ink)',
      borderColor: 'var(--ink)',
      color: '#fff',
    },
  },
});

globalStyle(`html[data-filter="rail"] .${fcatBtn}`, {
  '@media': {
    '(max-width: 860px)': {
      width: 'auto',
      flex: '0 0 auto',
      border: '1px solid var(--line)',
      borderRadius: 10,
      padding: '9px 15px',
      background: 'var(--surface)',
      whiteSpace: 'nowrap',
    },
  },
});

globalStyle(`html[data-filter="rail"] .${fcatBtn}[aria-pressed="true"]`, {
  '@media': {
    '(max-width: 860px)': {
      background: 'var(--ink)',
      borderColor: 'var(--ink)',
      color: '#fff',
    },
  },
});

const fcatCount = style({
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--n-06)',
  fontVariantNumeric: 'tabular-nums',
  selectors: {
    '[aria-pressed="true"] &': { color: 'rgba(255,255,255,0.6)' },
    'html[data-filter="bar"] &': { display: 'none' },
  },
});

/* ── fmore 토글/패널 ── */
const fmoreToggle = style({
  display: 'none',
  '@media': {
    '(max-width: 860px)': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      width: '100%',
      appearance: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font)',
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--fg)',
      textAlign: 'left',
      background: 'var(--surface-2)',
      border: '1px solid var(--line)',
      borderRadius: 10,
      padding: '13px 16px',
      transition: 'background var(--d) var(--ease)',
    },
  },
  selectors: {
    '&:hover': { background: 'var(--surface)' },
  },
});

globalStyle(`${fmoreToggle} svg`, {
  width: 18,
  height: 18,
  color: 'var(--fg-3)',
  transition: 'transform var(--d) var(--ease)',
});

globalStyle(`html[data-fmore="open"] .${fmoreToggle} svg`, {
  transform: 'rotate(180deg)',
});

const fmore = style({
  display: 'contents',
  '@media': {
    '(max-width: 860px)': {
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      maxHeight: 0,
      overflow: 'hidden',
      opacity: 0,
      pointerEvents: 'none',
      marginTop: -18,
      transition:
        'max-height var(--d) var(--ease), opacity var(--d) var(--ease), margin var(--d) var(--ease)',
    },
  },
});

globalStyle(`html[data-fmore="open"] .${fmore}`, {
  '@media': {
    '(max-width: 860px)': {
      maxHeight: 2400,
      opacity: 1,
      pointerEvents: 'auto',
      marginTop: 0,
    },
  },
});

/* ── 태그/저자 칩 목록 ── */
const fchips = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 7,
  selectors: {
    'html[data-filter="rail"] &': {
      maxHeight: 118,
      overflowY: 'auto',
      paddingRight: 4,
      scrollbarWidth: 'thin',
      scrollbarColor: 'var(--n-04) transparent',
    },
    'html[data-tagstyle="hash"] &, html[data-tagstyle="underline"] &, html[data-tagstyle="bracket"] &':
      {
        gap: '5px 7px',
      },
  },
});

globalStyle(`html[data-filter="rail"] .${fchips}::-webkit-scrollbar`, {
  width: 8,
});

globalStyle(`html[data-filter="rail"] .${fchips}::-webkit-scrollbar-thumb`, {
  background: 'var(--n-04)',
  borderRadius: 4,
  border: '2px solid transparent',
  backgroundClip: 'content-box',
});

globalStyle(`html[data-filter="rail"] .${fchips}`, {
  '@media': {
    '(max-width: 860px)': {
      maxHeight: 'none',
      overflow: 'visible',
      paddingRight: 0,
    },
  },
});

const fchip = style({
  appearance: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--font)',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--fg-2)',
  border: '1px solid var(--line)',
  background: 'var(--surface)',
  padding: '6px 12px',
  borderRadius: 999,
  transition: 'all var(--d) var(--ease)',
  selectors: {
    '&:hover': { borderColor: 'var(--ink)', color: 'var(--ink)' },
    '&[aria-pressed="true"]': {
      background: 'var(--accent)',
      borderColor: 'var(--accent)',
      color: 'var(--accent-contrast)',
    },
    'html[data-shape="sharp"] &': { borderRadius: 3 },
    /* underline */
    'html[data-tagstyle="underline"] &': {
      border: 'none',
      background: 'none',
      borderRadius: 0,
      padding: '3px 1px',
      borderBottom: '1.5px solid var(--line)',
    },
    'html[data-tagstyle="underline"] &:hover': {
      color: 'var(--ink)',
      borderBottomColor: 'var(--ink)',
    },
    'html[data-tagstyle="underline"] &[aria-pressed="true"]': {
      background: 'none',
      color: 'var(--accent)',
      borderBottomColor: 'var(--accent)',
      borderBottomWidth: 2,
    },
    /* hash */
    'html[data-tagstyle="hash"] &': {
      border: 'none',
      background: 'none',
      borderRadius: 0,
      padding: '3px 2px',
    },
    'html[data-tagstyle="hash"] &:hover': { color: 'var(--ink)' },
    'html[data-tagstyle="hash"] &[aria-pressed="true"]': {
      background: 'none',
      color: 'var(--accent)',
    },
    /* bracket */
    'html[data-tagstyle="bracket"] &': {
      border: 'none',
      background: 'none',
      borderRadius: 0,
      padding: '3px 1px',
      fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace',
      fontSize: 12.5,
      letterSpacing: '-0.01em',
    },
    'html[data-tagstyle="bracket"] &:hover': { color: 'var(--ink)' },
    'html[data-tagstyle="bracket"] &[aria-pressed="true"]': {
      background: 'none',
      color: 'var(--accent)',
    },
  },
});

globalStyle(`html[data-tagstyle="hash"] .${fchip}::before`, {
  content: '"#"',
  opacity: 0.45,
  marginRight: 1,
  fontWeight: 700,
});

globalStyle(
  `html[data-tagstyle="hash"] .${fchip}[aria-pressed="true"]::before`,
  {
    opacity: 1,
    color: 'var(--accent)',
  },
);

globalStyle(`html[data-tagstyle="bracket"] .${fchip}::before`, {
  content: '"["',
  opacity: 0.4,
  marginRight: 2,
});

globalStyle(`html[data-tagstyle="bracket"] .${fchip}::after`, {
  content: '"]"',
  opacity: 0.4,
  marginLeft: 2,
});

globalStyle(
  `html[data-tagstyle="bracket"] .${fchip}[aria-pressed="true"]::before,
             html[data-tagstyle="bracket"] .${fchip}[aria-pressed="true"]::after`,
  {
    opacity: 0.9,
    color: 'var(--accent)',
  },
);

/* ── 아카이브 ── */
const farchive = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  maxHeight: 240,
  overflowY: 'auto',
  padding: '8px 0',
  '@media': {
    '(max-width: 860px)': {
      maxHeight: 'none',
    },
  },
});

const farchiveBtn = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  appearance: 'none',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--font)',
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--fg-2)',
  padding: '8px 12px',
  borderRadius: 'var(--r-btn)',
  textAlign: 'left',
  transition: 'background var(--d) var(--ease), color var(--d) var(--ease)',
  selectors: {
    '&:hover': { background: 'var(--surface-2)', color: 'var(--ink)' },
    '&[aria-pressed="true"]': { color: 'var(--accent)' },
  },
});

const farchiveCount = style({
  fontSize: 12,
  color: 'var(--n-06)',
});

/* ── 바 레이아웃 드롭다운 ── */
const barselects = style({
  display: 'none',
  selectors: {
    'html[data-filter="bar"] &': {
      display: 'flex',
      gap: 10,
    },
  },
});

globalStyle(`${barselects} select`, {
  appearance: 'none',
  fontFamily: 'var(--font)',
  fontSize: 13.5,
  fontWeight: 600,
  color: 'var(--fg)',
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--r-btn)',
  padding: '9px 32px 9px 14px',
  cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%23717171' d='M0 0h12L6 8z'/></svg>")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
});

globalStyle(`${barselects} select:focus`, {
  outline: 'none',
  borderColor: 'var(--accent)',
});

/* ── 결과 영역 ── */
const resultsBar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  paddingBottom: 18,
  marginBottom: 28,
  flexWrap: 'wrap',
});

const resultsCount = style({
  fontSize: 14,
  color: 'var(--fg-2)',
});

globalStyle(`${resultsCount} b`, {
  color: 'var(--ink)',
  fontWeight: 700,
});

const resultsActive = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  alignItems: 'center',
});

const activechip = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 12.5,
  fontWeight: 600,
  background: 'var(--accent-soft)',
  color: 'var(--accent-strong)',
  border: '1px solid var(--accent-soft-2)',
  padding: '5px 10px',
  borderRadius: 999,
  cursor: 'pointer',
});

globalStyle(`${activechip} svg`, {
  width: 13,
  height: 13,
});

const resultsClear = style({
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--fg-2)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'underline',
  textUnderlineOffset: 3,
  selectors: {
    '&:hover': { color: 'var(--accent)' },
  },
});

const results = style({
  selectors: {
    'html[data-filter="bar"] &': { marginTop: 36 },
  },
});

const empty = style({
  textAlign: 'center',
  padding: '80px 20px',
  color: 'var(--fg-2)',
});

globalStyle(`${empty} h3`, {
  fontSize: 20,
  color: 'var(--ink)',
  marginBottom: 8,
});

/* ── 카드 그리드 ── */
const cardgrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '46px 32px',
  selectors: {
    'html[data-cols="2"] &': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '48px 40px',
    },
    'html[data-card="minimal"] &': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '30px 44px',
    },
    'html[data-card="list"] &': {
      gridTemplateColumns: '1fr !important',
      gap: '0',
    },
    'html[data-thumb="off"][data-card="stacked"] &, html[data-thumb="off"][data-card="minimal"] &':
      {
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0 1px',
        background: 'var(--line)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-card)',
        overflow: 'hidden',
      },
    'html[data-thumb="off"][data-card="stacked"][data-cols="2"] &': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    'html[data-thumb="off"][data-card="overlay"] &': {
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '28px 24px',
    },
  },
  '@media': {
    '(max-width: 980px)': {
      gridTemplateColumns: 'repeat(2, 1fr) !important',
      gap: '40px 28px',
    },
    '(max-width: 620px)': {
      gridTemplateColumns: '1fr !important',
      gap: '34px',
    },
  },
});

globalStyle(`html[data-card="minimal"] .${cardgrid}`, {
  '@media': {
    '(max-width: 980px)': {
      gridTemplateColumns: '1fr !important',
    },
  },
});

globalStyle(
  `html[data-thumb="off"][data-card="stacked"] .${cardgrid},
             html[data-thumb="off"][data-card="minimal"] .${cardgrid}`,
  {
    '@media': {
      '(max-width: 980px)': {
        gridTemplateColumns: 'repeat(2, 1fr) !important',
      },
      '(max-width: 620px)': {
        gridTemplateColumns: '1fr !important',
      },
    },
  },
);

globalStyle(`html[data-thumb="off"][data-card="overlay"] .${cardgrid}`, {
  '@media': {
    '(max-width: 980px)': {
      gridTemplateColumns: 'repeat(2, 1fr) !important',
    },
    '(max-width: 620px)': {
      gridTemplateColumns: '1fr !important',
    },
  },
});

/* ── 더보기 버튼 (editorial: hairline rule × 2 + circular chevron) ── */
const loadmoreWrap = style({
  display: 'flex',
  alignItems: 'center',
  gap: 22,
  marginTop: 60,
});
globalStyle(`html[data-card="list"] ${loadmoreWrap}`, { marginTop: 14 });

const loadmoreRule = style({
  flex: '1 1 0',
  height: 1,
  background: 'var(--line)',
});

const loadmoreBtn = style({
  flex: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 12,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '6px 4px',
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: '-0.01em',
  color: 'var(--fg-2)',
  transition: 'color var(--d) var(--ease)',
  selectors: {
    '&:hover:not(:disabled)': { color: 'var(--ink)' },
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
  },
});

const loadmoreIcon = style({
  width: 32,
  height: 32,
  borderRadius: 999,
  border: '1.5px solid var(--line)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition:
    'border-color var(--d) var(--ease), background var(--d) var(--ease)',
});
globalStyle(`html[data-shape="sharp"] ${loadmoreIcon}`, { borderRadius: 5 });
globalStyle(`${loadmoreIcon} svg`, {
  width: 15,
  height: 15,
  transition: 'transform var(--d) var(--ease)',
});
globalStyle(`${loadmoreBtn}:hover:not(:disabled) ${loadmoreIcon}`, {
  borderColor: 'var(--ink)',
  background: 'var(--ink)',
  color: 'var(--bg)',
});
globalStyle(`${loadmoreBtn}:hover:not(:disabled) ${loadmoreIcon} svg`, {
  transform: 'translateY(2px)',
});

const styles = {
  listBody,
  filters,
  fsearch,
  fgroupLabel,
  fcat,
  fcatBtn,
  fcatCount,
  fmoreToggle,
  fmore,
  fchips,
  fchip,
  farchive,
  farchiveBtn,
  farchiveCount,
  barselects,
  resultsBar,
  resultsCount,
  resultsActive,
  activechip,
  resultsClear,
  results,
  empty,
  cardgrid,
  loadmoreWrap,
  loadmoreRule,
  loadmoreBtn,
  loadmoreIcon,
};

export default styles;
