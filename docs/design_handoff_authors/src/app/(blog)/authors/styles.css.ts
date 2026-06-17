import { style, globalStyle } from "@vanilla-extract/css";

const head = style({
  paddingBottom: 36,
  borderBottom: "none",
});

// 인트로 문단은 컨테이너 폭에 맞춰 흐르도록 journal.css의 .listhead p max-width 해제
globalStyle(`.${head} p`, {
  maxWidth: "none",
});

const eyebrow = style({
  display: "inline-block",
  marginBottom: 14,
});

const list = style({
  display: "flex",
  flexDirection: "column",
  padding: "32px 0 8px",
  selectors: {
    // 박스형 옵션은 행 사이 간격
    'html[data-acard="filled"] &': { gap: 12 },
    'html[data-acard="border"] &': { gap: 12 },
    'html[data-acard="shadow"] &': { gap: 14 },
  },
});

const empty = style({
  padding: "80px 0",
  textAlign: "center",
  selectors: {
    "& h3": {
      fontSize: 20,
      fontWeight: 800,
      letterSpacing: "-0.02em",
      color: "var(--ink)",
    },
    "& p": {
      marginTop: 10,
      fontSize: 15,
      color: "var(--fg-2)",
    },
  },
});

const styles = { head, eyebrow, list, empty };

export default styles;
