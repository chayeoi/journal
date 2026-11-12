import type { PostgrestError } from '@supabase/supabase-js';

// PostgreSQL invalid_text_representation — 예: uuid 컬럼에 'abc'를 넣은 조회.
// 그런 키를 가진 행은 존재할 수 없으므로 "행 없음"과 같게 본다.
const INVALID_TEXT_REPRESENTATION = '22P02';

/** 조회 키 형식이 컬럼 타입과 맞지 않아 실패한 경우인지 (= 행이 있을 수 없음). */
export function isInvalidKeyError(error: PostgrestError): boolean {
  return error.code === INVALID_TEXT_REPRESENTATION;
}

/**
 * 일시적 DB 오류(타임아웃·연결 실패·스키마 캐시 오류 등)를 던진다.
 *
 * 이런 오류를 "글 없음"으로 바꿔 반환하면 페이지가 notFound()로 렌더되고,
 * ISR이 그 404(+ noindex) 결과를 캐시해 검색엔진이 정상 글을 색인 제외한다.
 * 던지면 ISR 재검증이 실패로 끝나 직전의 정상 캐시가 계속 서빙된다.
 */
export function throwQueryError(context: string, error: PostgrestError): never {
  // Cloudflare 522/524는 message에 HTML 페이지 전체가 들어오므로 잘라서 남긴다.
  const message = (error.message ?? '').slice(0, 300);
  throw new Error(
    `[supabase] ${context} 조회 실패 (code=${error.code || 'none'}): ${message}`,
    { cause: error },
  );
}
