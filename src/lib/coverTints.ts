export const COVER_TINTS = [
  { from: '#14161A', to: '#292D34' }, // ink
  { from: '#141F33', to: '#22355A' }, // navy
  { from: '#142622', to: '#22453C' }, // pine
  { from: '#241A16', to: '#41312A' }, // umber
  { from: '#1D1930', to: '#332B52' }, // plum
  { from: '#2A171D', to: '#4A2A33' }, // wine
] as const;

/** thumbnail_url이 없는 아티클에 배정할 팔레트 인덱스. post id 해시 기반으로 안정적이다. */
export function tintIndex(postId: string): number {
  let h = 0;
  for (let i = 0; i < postId.length; i++) {
    h = (h * 31 + postId.charCodeAt(i)) % 100003;
  }
  return h % COVER_TINTS.length;
}

/** CSS 커스텀 프로퍼티(--tint)로 넘길 linear-gradient 값. */
export function tintBg(postId: string): string {
  const t = COVER_TINTS[tintIndex(postId)];
  return `linear-gradient(135deg, ${t.from} 0%, ${t.to} 100%)`;
}
