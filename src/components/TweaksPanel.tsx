"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const LS_KEY = "auctoritas.tweaks.v4";

const TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}
  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}
  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none;cursor:default}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2}
`;

const DEFAULTS = {
  font: "pretendard" as string,
  thumb: "on" as "on" | "off",
  reading: "railed" as "railed" | "centered" | "wide",
  tagstyle: "hash" as string,
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
  r.style.setProperty("--accent", "#3B82F6");
  r.setAttribute("data-font", v.font);
  r.setAttribute("data-shape", "rounded");
  r.setAttribute("data-carousel", "overlay");
  r.setAttribute("data-filter", "rail");
  r.setAttribute("data-card", "list");
  r.setAttribute("data-tagstyle", v.tagstyle);
  r.setAttribute("data-reading", v.reading);
  r.setAttribute("data-thumb", v.thumb);
}

export function TweaksPanel() {
  const [open, setOpen] = useState(false);
  const [t, setT] = useState<Tweaks>(DEFAULTS);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 16, y: 16 });

  const page =
    typeof document !== "undefined"
      ? (document.documentElement.getAttribute("data-page") ?? "home")
      : "home";

  useEffect(() => {
    const loaded = loadTweaks();
    setT(loaded);
    applyTweaks(loaded);
  }, []);

  useEffect(() => {
    applyTweaks(t);
    saveTweaks(t);
    window.dispatchEvent(new CustomEvent("tweakchange", { detail: t }));
  }, [t]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "__activate_edit_mode") setOpen(true);
      else if (e.data?.type === "__deactivate_edit_mode") setOpen(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
  };

  const clamp = useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const PAD = 16;
    const maxRight = Math.max(PAD, window.innerWidth - panel.offsetWidth - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - panel.offsetHeight - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y)),
    };
    panel.style.right = offsetRef.current.x + "px";
    panel.style.bottom = offsetRef.current.y + "px";
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
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  if (!open) return null;

  const set = (key: keyof Tweaks, val: string) =>
    setT((prev) => ({ ...prev, [key]: val }));

  return (
    <>
      <style>{TWEAKS_STYLE}</style>
      <div
        ref={dragRef}
        className="twk-panel"
        style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}
      >
        <div className="twk-hd" onMouseDown={onDragStart}>
          <b>Tweaks</b>
          <button className="twk-x" aria-label="Close tweaks" onClick={dismiss}>
            ✕
          </button>
        </div>
        <div className="twk-body">
          <div className="twk-sect">아티클 카드</div>
          <TweakRadio
            label="썸네일"
            value={t.thumb}
            options={[
              { value: "on", label: "표시" },
              { value: "off", label: "숨김" },
            ]}
            onChange={(v) => set("thumb", v)}
          />

          {page === "detail" && (
            <>
              <div className="twk-sect">본문 레이아웃</div>
              <TweakRadio
                label="읽기"
                value={t.reading}
                options={[
                  { value: "railed", label: "목차" },
                  { value: "centered", label: "중앙" },
                  { value: "wide", label: "와이드" },
                ]}
                onChange={(v) => set("reading", v)}
              />
            </>
          )}

          <div className="twk-sect">서체</div>
          <TweakSelect
            label="글꼴"
            value={t.font}
            options={[
              { value: "pretendard", label: "Pretendard (기본)" },
              { value: "noto", label: "Noto Sans KR" },
              { value: "plex", label: "IBM Plex Sans KR" },
              { value: "system", label: "시스템" },
            ]}
            onChange={(v) => set("font", v)}
          />
        </div>
      </div>
    </>
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
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <div className="twk-row">
      <div className="twk-lbl"><span>{label}</span></div>
      <div
        ref={trackRef}
        role="radiogroup"
        className="twk-seg"
        onClick={(e) => {
          const el = trackRef.current;
          if (!el) return;
          const r = el.getBoundingClientRect();
          const i = Math.floor(((e.clientX - r.left - 2) / (r.width - 4)) * n);
          const opt = options[Math.max(0, Math.min(n - 1, i))];
          if (opt) onChange(opt.value);
        }}
      >
        <div
          className="twk-seg-thumb"
          style={{
            left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
            width: `calc((100% - 4px) / ${n})`,
          }}
        />
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value}>
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
    <div className="twk-row">
      <div className="twk-lbl"><span>{label}</span></div>
      <select
        className="twk-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
