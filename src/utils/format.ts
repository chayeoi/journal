export function fmtDate(iso: string, opt: "long" | "short" = "long"): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (opt === "short") {
    return `${y}.${String(m).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
  }
  return `${y}년 ${m}월 ${day}일`;
}
