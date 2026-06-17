// tweaks-journal.jsx — AUCTORITAS LAB page-aware Tweaks.
// Global tweaks (accent, font, corners) show everywhere; structural tweaks
// (carousel / card / columns / filter / reading) show only where they apply.
// Values persist to localStorage so the theme survives page navigation.

const LS_KEY = "auctoritas.tweaks.v4";

const DEFAULTS = {
  accent: "#3B82F6",
  font: "pretendard",
  shape: "rounded",
  carousel: "overlay",
  card: "stacked",
  cols: "3",
  thumb: "on",
  cover: "overlay",
  filter: "rail",
  tagstyle: "hash",
  reading: "railed",
  acard: "plain",
};

function loadTweaks() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch (e) {}
  return { ...DEFAULTS };
}

function saveTweaks(v) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(v)); } catch (e) {}
}

// Apply every value to <html> as attribute / custom-property.
function applyTweaks(v) {
  const r = document.documentElement;
  r.style.setProperty("--accent", "#3B82F6"); // locked
  r.setAttribute("data-font", v.font);
  r.setAttribute("data-shape", "rounded");   // locked
  r.setAttribute("data-carousel", "overlay"); // locked
  r.setAttribute("data-filter", "rail");      // locked
  r.setAttribute("data-card", "list"); // locked
  r.setAttribute("data-tagstyle", "hash"); // locked
  r.setAttribute("data-reading", v.reading);
  r.setAttribute("data-cover", "overlay"); // locked
  r.setAttribute("data-acard", v.acard || "plain");
}

// Run immediately so the first paint + page render see correct attributes.
window.applyTweaksNow = function () { applyTweaks(loadTweaks()); };
window.applyTweaksNow();

function App() {
  const page = document.documentElement.getAttribute("data-page") || "home";
  const [t, setTweak] = useTweaks(loadTweaks());

  React.useEffect(() => {
    applyTweaks(t);
    saveTweaks(t);
  }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      {(page === "home" || page === "detail") && (
        <React.Fragment>
          <TweakSection label="아티클 카드" />
          <TweakRadio label="썸네일" value={t.thumb}
            options={[
              { value: "on", label: "표시" },
              { value: "off", label: "숨김" },
            ]}
            onChange={(v) => setTweak("thumb", v)} />

        </React.Fragment>
      )}



      {page === "authors" && (
        <React.Fragment>
          <TweakSection label="작가 리스트" />
          <TweakRadio label="스타일" value={t.acard}
            options={[
              { value: "plain", label: "라인" },
              { value: "filled", label: "채움" },
              { value: "border", label: "보더" },
              { value: "shadow", label: "그림자" },
            ]}
            onChange={(v) => setTweak("acard", v)} />
        </React.Fragment>
      )}

      {page === "detail" && (
        <React.Fragment>
          <TweakSection label="본문 레이아웃" />
          <TweakRadio label="읽기" value={t.reading}
            options={[
              { value: "railed", label: "목차" },
              { value: "centered", label: "중앙" },
              { value: "wide", label: "와이드" },
            ]}
            onChange={(v) => setTweak("reading", v)} />
        </React.Fragment>
      )}

      <TweakSection label="서체" />
      <TweakSelect label="글꼴" value={t.font}
        options={[
          { value: "pretendard", label: "Pretendard (기본)" },
          { value: "noto", label: "Noto Sans KR" },
          { value: "plex", label: "IBM Plex Sans KR" },
          { value: "system", label: "시스템" },
        ]}
        onChange={(v) => setTweak("font", v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<App />);
