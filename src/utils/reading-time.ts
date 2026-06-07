export function calcReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  // 한국어 기준 분당 ~500자 읽기 속도
  const chars = text.length;
  return Math.max(1, Math.ceil(chars / 500));
}
