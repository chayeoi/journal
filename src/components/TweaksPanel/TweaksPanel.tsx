'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './styles.css';

const LS_KEY = 'auctoritas.tweaks.v4';

const DEFAULTS = {
  font: 'pretendard' as string,
  thumb: 'on' as 'on' | 'off',
  reading: 'railed' as 'railed' | 'centered' | 'wide',
  tagstyle: 'hash' as string,
};

type Tweaks = typeof DEFAULTS;

function loadTweaks(): Tweaks {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULTS };
}

function saveTweaks(v: Tweaks) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(v));
  } catch {}
}

function applyTweaks(v: Tweaks) {
  const r = document.documentElement;
  r.style.setProperty('--accent', '#3B82F6');
  r.setAttribute('data-font', v.font);
  r.setAttribute('data-shape', 'rounded');
  r.setAttribute('data-carousel', 'overlay');
  r.setAttribute('data-filter', 'rail');
  r.setAttribute('data-card', 'list');
  r.setAttribute('data-tagstyle', v.tagstyle);
  r.setAttribute('data-reading', v.reading);
  r.setAttribute('data-thumb', v.thumb);
}

function TweaksPanel() {
  const [open, setOpen] = useState(false);
  const [t, setT] = useState<Tweaks>(DEFAULTS);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 16, y: 16 });

  const page =
    typeof document !== 'undefined'
      ? (document.documentElement.getAttribute('data-page') ?? 'home')
      : 'home';

  // localStorage는 SSR 이후 hydration 단계에서만 읽을 수 있어 useEffect 내에서 초기화
  useEffect(() => {
    const loaded = loadTweaks();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setT(loaded);
    applyTweaks(loaded);
  }, []);

  useEffect(() => {
    applyTweaks(t);
    saveTweaks(t);
    window.dispatchEvent(new CustomEvent('tweakchange', { detail: t }));
  }, [t]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === '__activate_edit_mode') setOpen(true);
      else if (e.data?.type === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  };

  const clamp = useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const PAD = 16;
    const maxRight = Math.max(PAD, window.innerWidth - panel.offsetWidth - PAD);
    const maxBottom = Math.max(
      PAD,
      window.innerHeight - panel.offsetHeight - PAD,
    );
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y)),
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);

  useEffect(() => {
    if (!open) return;
    clamp();
    const ro = new ResizeObserver(clamp);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clamp]);

  const onDragStart = (e: React.MouseEvent) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX;
    const sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev: MouseEvent) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy),
      };
      clamp();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  if (!open) return null;

  const set = (key: keyof Tweaks, val: string) =>
    setT(prev => ({ ...prev, [key]: val }));

  return (
    <div
      ref={dragRef}
      className={styles.panel}
      style={{ right: 16, bottom: 16 }}
    >
      <div className={styles.header} onMouseDown={onDragStart}>
        <b>Tweaks</b>
        <button
          className={styles.closeBtn}
          aria-label="Close tweaks"
          onClick={dismiss}
        >
          ✕
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.sect}>아티클 카드</div>
        <TweakRadio
          label="썸네일"
          value={t.thumb}
          options={[
            { value: 'on', label: '표시' },
            { value: 'off', label: '숨김' },
          ]}
          onChange={v => set('thumb', v)}
        />

        {page === 'detail' && (
          <>
            <div className={styles.sect}>본문 레이아웃</div>
            <TweakRadio
              label="읽기"
              value={t.reading}
              options={[
                { value: 'railed', label: '목차' },
                { value: 'centered', label: '중앙' },
                { value: 'wide', label: '와이드' },
              ]}
              onChange={v => set('reading', v)}
            />
          </>
        )}

        <div className={styles.sect}>서체</div>
        <TweakSelect
          label="글꼴"
          value={t.font}
          options={[
            { value: 'pretendard', label: 'Pretendard (기본)' },
            { value: 'noto', label: 'Noto Sans KR' },
            { value: 'plex', label: 'IBM Plex Sans KR' },
            { value: 'system', label: '시스템' },
          ]}
          onChange={v => set('font', v)}
        />
      </div>
    </div>
  );
}

interface TweakRadioProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

function TweakRadio({ label, value, options, onChange }: TweakRadioProps) {
  const n = options.length;
  const idx = Math.max(
    0,
    options.findIndex(o => o.value === value),
  );
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.row}>
      <div className={styles.label}>
        <span>{label}</span>
      </div>
      <div
        ref={trackRef}
        role="radiogroup"
        className={styles.seg}
        onClick={e => {
          const el = trackRef.current;
          if (!el) return;
          const r = el.getBoundingClientRect();
          const i = Math.floor(((e.clientX - r.left - 2) / (r.width - 4)) * n);
          const opt = options[Math.max(0, Math.min(n - 1, i))];
          if (opt) onChange(opt.value);
        }}
      >
        <div
          className={styles.segThumb}
          style={{
            left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
            width: `calc((100% - 4px) / ${n})`,
          }}
        />
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            className={styles.segBtn}
            role="radio"
            aria-checked={o.value === value}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface TweakSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

function TweakSelect({ label, value, options, onChange }: TweakSelectProps) {
  return (
    <div className={styles.row}>
      <div className={styles.label}>
        <span>{label}</span>
      </div>
      <select
        className={styles.field}
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default TweaksPanel;
