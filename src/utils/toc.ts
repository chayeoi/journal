export type Heading = { id: string; text: string };

/** HTML에서 h2 헤딩을 추출하여 목차 데이터 반환 */
export function extractHeadings(html: string): Heading[] {
  const headings: Heading[] = [];
  let i = 0;
  const re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, "").trim();
    headings.push({ id: `sec-${i + 1}`, text });
    i++;
  }
  return headings;
}

/** HTML의 각 h2에 id="sec-N" 주입 */
export function injectHeadingIds(html: string): string {
  let i = 0;
  return html.replace(/<h2([^>]*)>/gi, (_, attrs) => {
    // 이미 id가 있으면 덮어쓰지 않음
    if (/\bid=/.test(attrs)) return `<h2${attrs}>`;
    return `<h2${attrs} id="sec-${++i}">`;
  });
}
