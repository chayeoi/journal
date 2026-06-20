import { style, globalStyle } from '@vanilla-extract/css';

const panel = style({
  position: 'fixed',
  right: 16,
  bottom: 16,
  zIndex: 2147483646,
  width: 280,
  maxHeight: 'calc(100vh - 32px)',
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(250,249,247,.78)',
  color: '#29261b',
  WebkitBackdropFilter: 'blur(24px) saturate(160%)',
  backdropFilter: 'blur(24px) saturate(160%)',
  border: '.5px solid rgba(255,255,255,.6)',
  borderRadius: 14,
  boxShadow: '0 1px 0 rgba(255,255,255,.5) inset, 0 12px 40px rgba(0,0,0,.18)',
  font: '11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif',
  overflow: 'hidden',
});

const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 8px 10px 14px',
  cursor: 'move',
  userSelect: 'none',
});

globalStyle(`${header} b`, {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '.01em',
});

const closeBtn = style({
  appearance: 'none',
  border: 0,
  background: 'transparent',
  color: 'rgba(41,38,27,.55)',
  width: 22,
  height: 22,
  borderRadius: 6,
  cursor: 'default',
  fontSize: 13,
  lineHeight: 1,
  selectors: {
    '&:hover': { background: 'rgba(0,0,0,.06)', color: '#29261b' },
  },
});

const body = style({
  padding: '2px 14px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  overflowY: 'auto',
  overflowX: 'hidden',
  minHeight: 0,
});

const row = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
});

const label = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  color: 'rgba(41,38,27,.72)',
});

globalStyle(`${label} > span:first-child`, {
  fontWeight: 500,
});

const sect = style({
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  color: 'rgba(41,38,27,.45)',
  padding: '10px 0 0',
  selectors: {
    '&:first-child': { paddingTop: 0 },
  },
});

const field = style({
  appearance: 'none',
  boxSizing: 'border-box',
  width: '100%',
  minWidth: 0,
  height: 26,
  padding: '0 8px',
  border: '.5px solid rgba(0,0,0,.1)',
  borderRadius: 7,
  background: 'rgba(255,255,255,.6)',
  color: 'inherit',
  font: 'inherit',
  outline: 'none',
});

globalStyle(`select.${field}`, {
  paddingRight: 22,
  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 8px center',
});

const seg = style({
  position: 'relative',
  display: 'flex',
  padding: 2,
  borderRadius: 8,
  background: 'rgba(0,0,0,.06)',
  userSelect: 'none',
  cursor: 'default',
});

const segThumb = style({
  position: 'absolute',
  top: 2,
  bottom: 2,
  borderRadius: 6,
  background: 'rgba(255,255,255,.9)',
  boxShadow: '0 1px 2px rgba(0,0,0,.12)',
  transition: 'left .15s cubic-bezier(.3,.7,.4,1), width .15s',
});

const segBtn = style({
  appearance: 'none',
  position: 'relative',
  zIndex: 1,
  flex: 1,
  border: 0,
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  fontWeight: 500,
  minHeight: 22,
  borderRadius: 6,
  cursor: 'default',
  padding: '4px 6px',
  lineHeight: 1.2,
});

const styles = {
  panel,
  header,
  closeBtn,
  body,
  row,
  label,
  sect,
  field,
  seg,
  segThumb,
  segBtn,
};

export default styles;
