export function fmtDate(iso: string, opt: "long" | "short" = "long"): string {
  // UTC+9(KST)로 고정하여 서버/클라이언트 타임존 차이에 의한 hydration mismatch 방지
  const kst = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
  const y = kst.getUTCFullYear();
  const m = kst.getUTCMonth() + 1;
  const day = kst.getUTCDate();
  if (opt === "short") {
    return `${y}.${String(m).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
  }
  return `${y}년 ${m}월 ${day}일`;
}
