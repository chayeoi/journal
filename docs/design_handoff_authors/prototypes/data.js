/* ============================================================
   AUCTORITAS LAB — journal dataset + render helpers
   공간분쟁(공사대금·부동산·임대차) 판례·실무 저널
   순수 데이터 + 무프레임워크 렌더 헬퍼. 모든 페이지가 공유.
   실제 서비스에선 커버 이미지를 Supabase Storage URL에서 서빙.
   ============================================================ */

const SITE = {
  name: "AUCTORITAS",
  lab: "AUCTORITAS LAB",
  tagline: "공간분쟁 전문 변호사팀이 직접 쓰는 판례·실무 저널",
  title: "공간을 둘러싼 분쟁, 법으로 풀어내다.",
  subtitle: "공사대금, 부동산, 임대차 등 공간분쟁을 판례와 실무 기준으로 정리합니다.",
  team: { name: "발행팀", url: "https://fightingspirit.kr", label: "fightingspirit.kr" },
  contact: {
    tel: "031-546-3997",
    fax: "031-546-3998",
    email: "info@fightingspirit.kr",
    instagram: "@auctoritas_journal",
    instagramUrl: "https://instagram.com/auctoritas_journal",
    address: "경기도 수원시 영통구 광교중앙로 248번길 7-2 원희캐슬법조타운 B동 401호",
  },
};

/* ---- authors ----
   E-E-A-T용 최소 필드: name(이름), bio(간략 소개), initials(폴백 아바타).
   집필 건수는 articlesByAuthor()로 도출. */
const AUTHORS = {
  kim: {
    id: "kim",
    name: "김도현",
    initials: "金",
    bio: "건설·부동산 분쟁을 14년간 다뤄온 공간분쟁 전문 변호사. 기성고 감정과 유치권 실무에 밝습니다.",
  },
  lee: {
    id: "lee",
    name: "이서연",
    initials: "李",
    bio: "부동산 매매·경계·재개발 사건을 중심으로, 감정평가 불복과 보상금 증액 소송 실무를 담당합니다.",
  },
  park: {
    id: "park",
    name: "박정우",
    initials: "朴",
    bio: "상가·주택 임대차와 명도·점유 분쟁 전문. 임차인·임대인 양측 자문 경험을 두루 갖췄습니다.",
  },
};

/* ---- categories (각 글은 1개) ---- */
const CATEGORIES = [
  { id: "construction", name: "공사대금", desc: "기성고·추가공사·유치권" },
  { id: "realestate", name: "부동산매매", desc: "이중매매·경계·하자담보" },
  { id: "lease", name: "임대차", desc: "권리금·갱신·차임" },
  { id: "redevelopment", name: "재개발·재건축", desc: "현금청산·분담금" },
  { id: "eviction", name: "명도·인도", desc: "가처분·인도집행" },
];

const P = (s) => `<p>${s}</p>`;

/* ---- articles ---- */
const ARTICLES = [
  {
    id: "gigseong-gamjeong",
    title: "공사대금 청구, 기성고 감정이 승패를 가른다",
    excerpt:
      "도급계약이 중도에 해지되면 ‘약정 공사대금’이 아니라 ‘기성고 비율에 따른 대금’을 청구하게 됩니다. 이때 기성고 감정을 어떤 기준으로 받아내느냐가 회수 금액을 좌우합니다.",
    category: "construction",
    tags: ["기성고", "도급계약", "감정", "공사중단"],
    author: "kim",
    date: "2026-05-18",
    reading: 9,
    body: [
      ["h2", "약정대금이 아니라 ‘기성고 비율’이 기준이다"],
      P("도급계약이 공사 도중 해제·해지되면, 수급인은 약정한 전체 공사대금을 그대로 청구할 수 없습니다. 대법원은 일찍이 ‘기성고 비율에 따른 보수’를 인정해 왔습니다. 즉 ‘완성된 부분이 차지하는 비율’을 약정 공사대금에 곱한 금액이 청구의 출발점이 됩니다."),
      P("문제는 그 ‘비율’을 어떻게 산정하느냐입니다. 단순히 ‘공사를 70% 했으니 70%’가 아니라, <strong>이미 투입된 공사비와 앞으로 투입될 공사비를 합한 전체 비용 중에서 기성 부분이 차지하는 비율</strong>로 계산합니다. 마감·설비처럼 후반부에 비용이 몰리는 공정 구조에서는, 외관상 70%처럼 보여도 기성고 비율은 그보다 훨씬 낮게 나오는 경우가 많습니다."),
      ["h2", "감정의 전제, ‘기준 시점’과 ‘설계도서’를 먼저 잡아라"],
      P("기성고 감정은 감정인이 자의적으로 하는 작업이 아닙니다. 법원은 ‘공사가 중단된 시점’을 기준으로, ‘당초 계약 내용(설계도서·내역서)’을 전제로 감정을 명합니다. 따라서 소송 초기에 ▲어느 시점에 공사가 중단되었는지 ▲그 시점의 시공 범위가 어디까지인지 ▲계약상 시공 기준이 무엇인지를 증거로 고정해 두는 것이 결정적입니다."),
      ["callout", "실무 포인트", "중단 시점의 현장 사진·작업일보·세금계산서·자재 반입 내역은 감정의 ‘입력값’입니다. 이 자료가 부실하면 감정인은 보수적으로 산정할 수밖에 없고, 그 불이익은 청구인에게 돌아갑니다."],
      ["h2", "추가·변경 공사가 섞여 있을 때"],
      P("현장에서는 계약서에 없는 추가공사가 늘 발생합니다. 추가공사대금은 기성고 감정과 별개의 쟁점으로, ‘추가공사의 합의가 있었는지’와 ‘그 대금에 관한 약정이 있었는지’를 따로 입증해야 합니다. 합의를 서면으로 남기지 못했다면, 변경 도면·발주자의 지시 문자·증액된 자재 발주 내역 등 간접 정황을 촘촘히 모아야 합니다."),
      ["h2", "정리"],
      P("기성고 사건의 승패는 법정 변론보다 ‘감정 준비’에서 갈립니다. 중단 시점을 명확히 하고, 그 시점의 시공 상태를 객관적 자료로 고정하며, 추가공사는 별도 트랙으로 입증하는 것 — 이 세 가지가 회수 금액을 끌어올리는 가장 확실한 방법입니다."),
    ],
  },
  {
    id: "chuga-gongsa-daegeum",
    title: "추가·변경 공사대금, ‘구두 합의’는 어디까지 인정되나",
    excerpt:
      "“현장에서 말로 다 합의했다”는 주장만으로 추가공사대금을 받기는 어렵습니다. 법원이 구두 합의를 인정하는 정황과, 반대로 배척하는 전형적 사례를 정리했습니다.",
    category: "construction",
    tags: ["추가공사", "변경계약", "구두합의", "입증책임"],
    author: "kim",
    date: "2026-03-30",
    reading: 8,
    body: [
      ["h2", "원칙: 추가공사대금은 청구하는 쪽이 증명한다"],
      P("추가·변경 공사대금을 청구하려면 ‘추가공사가 있었다’는 사실만으로는 부족합니다. ①발주자와 사이에 추가공사에 관한 <strong>합의(또는 지시)</strong>가 있었고, ②그에 대한 <strong>대금 약정</strong>이 있었다는 점을 청구인이 증명해야 합니다. 계약서·변경합의서가 없으면 이 두 가지를 정황으로 메워야 합니다."),
      ["h2", "구두 합의가 인정되는 정황"],
      P("법원은 서면이 없더라도 ▲발주자가 추가 도면·지시를 보낸 메시지 ▲추가 자재의 발주·반입 내역 ▲감리의 확인 ▲기존 계약 범위를 명백히 벗어난 시공 결과 등이 일관되게 모이면 ‘묵시적 합의’를 인정합니다. 핵심은 ‘발주자가 그 공사를 알고 용인했는가’입니다."),
      ["callout", "자주 지는 패턴", "‘좋게 좋게’ 진행하다 분쟁이 터진 뒤에야 추가공사를 주장하면, 발주자는 ‘서비스로 해준 것’이라 다투고 법원은 합의를 쉽게 인정하지 않습니다. 추가공사는 ‘그때그때’ 서면화하는 것이 최선입니다."],
      ["h2", "대금 약정이 없을 때 — ‘상당한 보수’"],
      P("합의는 인정되지만 구체적 대금 약정이 없는 경우, 법원은 동종 공사의 시가·품셈 등을 기준으로 ‘상당한 보수’를 정합니다. 이때도 감정이 동원되므로, 추가공사의 범위와 물량을 특정할 수 있는 자료가 결국 금액을 결정합니다."),
      ["h2", "정리"],
      P("‘말로 합의했다’는 주장은 출발점일 뿐입니다. 발주자의 인식과 용인을 보여주는 객관적 흔적을 얼마나 남겼는지가 추가공사대금 사건의 실질입니다."),
    ],
  },
  {
    id: "gwolligeum-hoesu",
    title: "상가 권리금 회수기회 보호, 임대인이 거절할 수 있는 정당한 사유",
    excerpt:
      "임차인이 주선한 신규 임차인을 임대인이 거절하면 손해배상 책임을 질 수 있습니다. 다만 법이 정한 ‘정당한 사유’가 있으면 거절이 허용됩니다. 그 경계를 판례로 짚었습니다.",
    category: "lease",
    tags: ["권리금", "회수기회", "상가임대차", "손해배상"],
    author: "park",
    date: "2026-02-11",
    reading: 10,
    body: [
      ["h2", "권리금 회수기회 보호란 무엇인가"],
      P("상가건물 임대차보호법은 임대차 종료 무렵, 임차인이 신규 임차인을 주선해 권리금을 회수할 기회를 임대인이 방해하지 못하도록 정하고 있습니다. 임대인이 정당한 사유 없이 신규 임차인과의 계약 체결을 거절하면, 임차인이 입은 권리금 상당의 손해를 배상할 수 있습니다."),
      ["h2", "임대인이 거절할 수 있는 ‘정당한 사유’"],
      P("법은 임대인이 거절할 수 있는 사유를 한정적으로 열거합니다. 대표적으로 ▲신규 임차인이 보증금·차임을 지급할 자력이 없는 경우 ▲임차인으로서 의무를 위반할 우려가 있는 경우 ▲임대차 목적물을 1년 6개월 이상 영리목적으로 사용하지 않은 경우 등입니다. 임대인은 이 사유의 존재를 스스로 증명해야 합니다."),
      ["callout", "실무 포인트", "임차인은 신규 임차인의 자력·이력 자료를 갖춰 ‘주선’ 사실을 명확히 남겨야 합니다. 임대인의 막연한 거절은 정당한 사유로 인정되지 않습니다."],
      ["h2", "‘재건축’ㆍ‘직접 사용’ 주장은 어디까지 통하나"],
      P("임대인이 ‘건물을 재건축하겠다’거나 ‘직접 장사하겠다’고 주장하는 경우가 많습니다. 그러나 이러한 사유는 법이 정한 정당한 사유에 곧바로 해당하지 않습니다. 판례는 임대인의 계획이 구체적이고 객관적으로 확정되었는지를 엄격히 봅니다."),
      ["h2", "손해배상의 범위"],
      P("배상액은 임차인이 주선한 신규 임차인이 지급하기로 한 권리금과, 임대차 종료 당시의 권리금 중 낮은 금액을 한도로 합니다. 따라서 권리금의 객관적 평가가 분쟁의 또 다른 축이 됩니다."),
      ["h2", "정리"],
      P("권리금 분쟁은 ‘주선의 충실함’과 ‘거절 사유의 정당성’이 정면으로 부딪치는 영역입니다. 임차인은 주선 과정을, 임대인은 거절 사유를 각각 기록으로 남기는 것이 핵심입니다."),
    ],
  },
  {
    id: "mukshijeok-gaengsin",
    title: "묵시적 갱신과 계약갱신요구권, 임차인이 자주 놓치는 차이",
    excerpt:
      "둘 다 ‘계약이 이어진다’는 점은 같지만, 존속기간·해지·차임 인상에서 전혀 다르게 작동합니다. 혼동하면 갱신요구권을 통째로 날릴 수 있습니다.",
    category: "lease",
    tags: ["묵시적갱신", "계약갱신요구권", "주택임대차", "차임증액"],
    author: "park",
    date: "2025-12-09",
    reading: 7,
    body: [
      ["h2", "묵시적 갱신 — ‘아무 말 없이’ 이어지는 경우"],
      P("임대차 기간이 끝나갈 무렵 양측이 아무런 통지를 하지 않으면 종전과 같은 조건으로 계약이 갱신된 것으로 봅니다. 이를 묵시적 갱신이라 합니다. 이 경우 임차인은 언제든 해지를 통지할 수 있고, 통지 후 일정 기간이 지나면 효력이 생깁니다."),
      ["h2", "계약갱신요구권 — ‘임차인이 행사’하는 권리"],
      P("계약갱신요구권은 임차인이 적극적으로 ‘갱신하겠다’는 의사를 임대인에게 통지해 행사하는 권리입니다. 정해진 기간 안에 행사해야 하고, 임대인은 법이 정한 거절사유가 없으면 거절하지 못합니다. 갱신 시 차임 증액에는 상한이 적용됩니다."),
      ["callout", "혼동 주의", "묵시적 갱신이 되었다고 해서 계약갱신요구권을 쓴 것은 아닙니다. 둘은 별개의 제도이며, 행사 시점과 효과가 다릅니다."],
      ["h2", "실무에서 갈리는 지점"],
      P("‘실거주’를 이유로 한 임대인의 갱신 거절, 차임 증액의 상한, 해지 통지의 효력 발생 시점 — 이 세 가지에서 분쟁이 집중됩니다. 임차인은 갱신요구의 의사표시를 ‘증거가 남는 방식’으로 해야 하고, 임대인은 거절사유를 객관적으로 입증해야 합니다."),
      ["h2", "정리"],
      P("‘계약이 이어진다’는 결과가 같아 보여도 경로가 다르면 권리도 다릅니다. 통지는 반드시 기록으로 남기십시오."),
    ],
  },
  {
    id: "yuchigwon-jeomyu",
    title: "유치권 주장, 공사업자가 점유로 지킬 수 있는 것과 없는 것",
    excerpt:
      "받지 못한 공사대금을 이유로 건물을 ‘점유’하면 유치권이 성립할 수 있습니다. 그러나 점유의 적법성과 견련성을 놓치면 오히려 불리해집니다.",
    category: "construction",
    tags: ["유치권", "점유", "공사대금", "경매"],
    author: "kim",
    date: "2025-11-02",
    reading: 9,
    body: [
      ["h2", "유치권의 두 기둥: 견련성과 적법한 점유"],
      P("유치권은 ‘그 물건에 관하여 생긴 채권’을 가진 사람이 그 물건을 점유할 때 인정됩니다. 공사대금 채권은 건물과의 견련성이 비교적 명확하지만, 진짜 다툼은 ‘점유’에서 벌어집니다. 점유는 적법하게 ‘계속’되어야 하며, 중간에 끊기면 유치권도 소멸합니다."),
      ["h2", "경매 절차에서의 유치권"],
      P("유치권은 경매 매수인에게도 대항할 수 있어, 실무에서 강력한 무기가 됩니다. 그러나 그만큼 법원은 점유의 진정성을 엄격히 심사합니다. 경매개시결정의 기입등기 이후에 비로소 점유를 시작했다면, 매수인에게 대항하지 못할 수 있습니다."),
      ["callout", "흔한 실수", "현장에 컨테이너만 두고 인적 관리가 없거나, 점유가 단속적으로 끊기면 ‘계속된 점유’가 부정됩니다. 점유는 ‘사실상 지배’가 외부에 드러나야 합니다."],
      ["h2", "허위 유치권의 위험"],
      P("대금을 부풀리거나 점유를 가장한 ‘허위 유치권’은 경매방해죄 등 형사책임으로 이어질 수 있습니다. 유치권은 정당한 채권과 진정한 점유가 전제될 때에만 방패가 됩니다."),
      ["h2", "정리"],
      P("유치권은 ‘성립’보다 ‘유지’가 어렵습니다. 점유의 시기·계속성·외부 표상을 기록으로 남기는 것이 사건을 지키는 길입니다."),
    ],
  },
  {
    id: "ijung-maemae",
    title: "이중매매와 배임, 가등기로 지키는 매수인의 권리",
    excerpt:
      "먼저 계약한 매수인이 늘 이기는 것은 아닙니다. 등기를 먼저 갖춘 쪽이 소유권을 얻는 구조에서, 매수인이 자신을 지키는 현실적 수단을 정리했습니다.",
    category: "realestate",
    tags: ["이중매매", "가등기", "배임", "소유권이전"],
    author: "lee",
    date: "2025-09-21",
    reading: 8,
    body: [
      ["h2", "‘먼저 계약’이 아니라 ‘먼저 등기’"],
      P("부동산 소유권은 등기를 갖춘 쪽이 취득합니다. 따라서 먼저 매매계약을 체결했더라도, 매도인이 제3자에게 이전등기를 마쳐버리면 앞선 매수인은 소유권을 잃을 수 있습니다. 이것이 이중매매의 위험입니다."),
      ["h2", "매도인의 배임, 제2매수인의 가담"],
      P("매도인이 중도금까지 받은 뒤 제3자에게 처분하면 배임이 문제될 수 있습니다. 나아가 제2매수인이 그 사정을 알고 적극 가담했다면, 그 매매는 반사회질서 법률행위로 무효가 될 수 있습니다. 다만 ‘적극 가담’의 증명은 쉽지 않습니다."),
      ["callout", "현실적 방어수단", "계약금·중도금 단계에서 소유권이전청구권 보전을 위한 ‘가등기’를 해두면, 이후의 처분에 대항할 수 있어 가장 확실한 방어가 됩니다."],
      ["h2", "처분금지가처분의 활용"],
      P("분쟁의 조짐이 보이면 즉시 부동산처분금지가처분을 신청해 매도인의 추가 처분을 막아야 합니다. 가처분 등기 이후의 처분은 매수인에게 대항하지 못합니다."),
      ["h2", "정리"],
      P("이중매매는 ‘속도전’입니다. 계약만 믿지 말고 가등기·가처분으로 등기부에 자신의 권리를 새겨두어야 합니다."),
    ],
  },
  {
    id: "gyeonggye-chimbeom",
    title: "토지 경계 침범 분쟁, 측량 감정과 취득시효",
    excerpt:
      "담장 하나가 수십 년의 분쟁이 됩니다. 지적도상 경계와 실제 점유의 어긋남을 어떻게 측량 감정으로 확정하고, 취득시효는 언제 문제되는지 정리했습니다.",
    category: "realestate",
    tags: ["경계분쟁", "측량감정", "취득시효", "지적도"],
    author: "lee",
    date: "2025-07-15",
    reading: 8,
    body: [
      ["h2", "경계는 ‘지적도’가 기준이다"],
      P("토지의 경계는 원칙적으로 지적공부에 등록된 지적선을 기준으로 판단합니다. 담장·도로처럼 현실의 경계가 지적선과 다르더라도, 분쟁의 기준선은 지적도입니다. 그래서 경계 사건은 거의 예외 없이 ‘측량 감정’으로 귀결됩니다."),
      ["h2", "측량 감정, 무엇을 다투나"],
      P("감정은 경계점을 현장에 복원하고, 침범 면적을 산출합니다. 다툼은 ▲기준점의 선택 ▲지적불부합지 여부 ▲성과의 정확도에서 발생합니다. 감정 결과에 이견이 있으면 사실조회·재감정을 통해 다툴 수 있습니다."),
      ["callout", "취득시효 쟁점", "오랜 기간 평온·공연하게 점유해 온 부분이 있다면, 점유취득시효로 그 부분의 소유권을 주장할 여지가 있습니다. ‘자주점유’의 추정과 그 번복이 핵심입니다."],
      ["h2", "해결의 방향"],
      P("경계 분쟁은 ‘이기고 지는’ 문제만이 아니라 ‘담장을 어디에 둘 것인가’의 문제입니다. 측량 결과를 토대로 경계 확정과 함께 현실적 조정(매수·교환·지료)을 병행하는 것이 분쟁을 끝내는 길입니다."),
      ["h2", "정리"],
      P("경계는 감정으로 확정되고, 점유는 시효로 보호됩니다. 두 축을 함께 검토해야 전략이 보입니다."),
    ],
  },
  {
    id: "hyeongeum-cheongsan",
    title: "현금청산 대상자의 권리, 감정평가에 불복하는 방법",
    excerpt:
      "분양신청을 하지 않으면 현금청산 대상자가 됩니다. 그때 받게 되는 보상금은 감정평가로 정해지는데, 이 평가에 불복하는 절차와 실익을 짚었습니다.",
    category: "redevelopment",
    tags: ["현금청산", "감정평가", "수용재결", "재개발"],
    author: "lee",
    date: "2025-05-27",
    reading: 11,
    body: [
      ["h2", "현금청산 대상자가 되는 길"],
      P("재개발·재건축에서 분양신청을 하지 않거나 철회한 조합원, 또는 분양대상에서 제외된 자는 현금청산 대상자가 됩니다. 이들은 새 아파트를 받는 대신, 종전 자산의 가액을 현금으로 보상받습니다."),
      ["h2", "보상금은 ‘감정평가’로 정해진다"],
      P("청산금은 종전 토지·건축물의 가액을 감정평가해 산정합니다. 사업시행자와 청산 대상자가 평가 결과를 두고 대립하는 경우가 대부분이며, 협의가 이뤄지지 않으면 수용재결 절차로 넘어갑니다."),
      ["callout", "불복의 단계", "수용재결에 불복하면 이의재결을 거쳐 행정소송(보상금 증액 청구)으로 다툴 수 있습니다. 이 단계에서 법원 감정을 통해 평가액을 다시 검증하게 됩니다."],
      ["h2", "평가에서 자주 다투는 항목"],
      P("거래사례의 선정, 개별요인 비교치, 영업손실·이전비, 그리고 ‘개발이익 배제’의 적정성이 주요 쟁점입니다. 종전 자산의 특성을 충실히 반영한 자료를 제출하는 것이 증액의 관건입니다."),
      ["h2", "정리"],
      P("현금청산은 ‘나가는 절차’가 아니라 ‘정당한 보상을 받아내는 절차’입니다. 감정 단계마다 적극적으로 의견과 자료를 내야 평가액이 움직입니다."),
    ],
  },
  {
    id: "jeomyu-ijeon-gacheobun",
    title: "점유이전금지가처분 없이 명도소송을 시작하면 생기는 일",
    excerpt:
      "어렵게 명도 승소 판결을 받아도, 점유자가 바뀌어 있으면 집행이 막힙니다. 본안 전에 점유이전금지가처분을 반드시 해두어야 하는 이유를 정리했습니다.",
    category: "eviction",
    tags: ["명도소송", "점유이전금지가처분", "인도집행", "당사자항정"],
    author: "park",
    date: "2025-04-08",
    reading: 7,
    body: [
      ["h2", "승소 판결이 ‘집행 가능한’ 판결이 되려면"],
      P("명도(인도) 판결은 ‘판결에 표시된 그 점유자’를 상대로만 집행할 수 있습니다. 소송 중 점유자가 제3자로 바뀌면, 새 점유자에게는 그 판결로 집행할 수 없어 처음부터 다시 다퉈야 합니다."),
      ["h2", "점유이전금지가처분의 ‘당사자 항정’ 효과"],
      P("본안소송 전에 점유이전금지가처분을 해두면, 이후 점유가 이전되더라도 ‘가처분채무자를 상대로 한 판결’로 승계인에 대한 집행이 가능해집니다. 이를 당사자 항정 효과라 하며, 명도 사건의 사실상 필수 절차입니다."),
      ["callout", "타이밍이 전부", "가처분은 ‘본안 전, 가능한 한 빨리’가 원칙입니다. 점유가 이미 넘어간 뒤에는 효과가 반감됩니다."],
      ["h2", "집행 단계에서의 실무"],
      P("가처분 집행 시 현장에서 점유 상태를 명확히 특정해 두면, 본안 승소 후 인도집행이 매끄럽게 진행됩니다. 점유자의 인적사항·물건 현황을 집행조서로 남기는 것이 중요합니다."),
      ["h2", "정리"],
      P("명도는 ‘이기는 것’보다 ‘집행하는 것’이 어렵습니다. 가처분으로 상대를 묶어두는 것이 사건의 절반입니다."),
    ],
  },
];

/* ============================================================
   HELPERS
   ============================================================ */
const AUTHOR_OF = (a) => AUTHORS[a.author];
const CAT_OF = (a) => CATEGORIES.find((c) => c.id === a.category);

function fmtDate(iso, opt = "long") {
  const d = new Date(iso + "T00:00:00");
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (opt === "short") return `${y}.${String(m).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
  return `${y}년 ${m}월 ${day}일`;
}

function byNewest(list) {
  return [...list].sort((a, b) => (a.date < b.date ? 1 : -1));
}

function relatedTo(article, n = 3) {
  const others = ARTICLES.filter((a) => a.id !== article.id);
  const scored = others.map((a) => {
    let s = 0;
    if (a.category === article.category) s += 3;
    if (a.author === article.author) s += 1;
    s += a.tags.filter((t) => article.tags.includes(t)).length * 2;
    return { a, s };
  });
  scored.sort((x, y) => y.s - x.s || (x.a.date < y.a.date ? 1 : -1));
  return scored.slice(0, n).map((x) => x.a);
}

function articleUrl(a) {
  return `article.html?id=${encodeURIComponent(a.id)}`;
}

/* ---- author helpers (E-E-A-T pages) ---- */
function authorUrl(au) {
  return `author.html?id=${encodeURIComponent(au.id)}`;
}
function articlesByAuthor(authorId) {
  return byNewest(ARTICLES.filter((a) => a.author === authorId));
}
function authorPostCount(authorId) {
  return ARTICLES.filter((a) => a.author === authorId).length;
}
/* 전문분야 = 실제 집필한 글의 카테고리 (CATEGORIES 순서, 중복 제거) */
function authorSpecialties(authorId) {
  const ids = new Set(
    ARTICLES.filter((a) => a.author === authorId).map((a) => a.category),
  );
  return CATEGORIES.filter((c) => ids.has(c.id));
}
/* 노출 순서: 집필 수 → 이름(가나다) */
function authorsBySeniority() {
  return Object.values(AUTHORS).sort((a, b) => {
    const c = authorPostCount(b.id) - authorPostCount(a.id);
    if (c) return c;
    return a.name.localeCompare(b.name, "ko");
  });
}

/* cover image — falls back to locally generated thumbnail.
   실제 서비스에선 article.cover 에 Supabase Storage URL을 넣으면 자동 대체. */
function coverOf(a) {
  return a.cover || `images/${a.id}.png`;
}

/* ---- icon set (Lucide-style, 2px stroke) ---- */
const ICON = {
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  cal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>`,
  tag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.6 2.6 21 11a2 2 0 0 1 0 2.8l-6.2 6.2a2 2 0 0 1-2.8 0L3.6 11.6A2 2 0 0 1 3 10.2V4a1 1 0 0 1 1-1h6.2a2 2 0 0 1 1.4.6Z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  insta: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18l-7 8v6l-4-2v-4Z"/></svg>`,
  quote: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h4v6c0 2.5-1.6 4.3-4 5l-.6-1.6C7.7 15.9 8.6 15 8.7 14H7Zm9 0h4v6c0 2.5-1.6 4.3-4 5l-.6-1.6c1.3-.5 2.2-1.4 2.3-2.4H16Z"/></svg>`,
};

/* ---- author avatar (typographic, no photo) ---- */
function avatarHTML(author, size = 40) {
  return `<span class="avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.42)}px" aria-hidden="true">${author.initials}</span>`;
}

/* ---- author avatar ----
   기본: 설정된 프로필 이미지. 없으면 검은 배경 + 흰 글씨로 이름 첫 글자. */
function authorAvatarHTML(au, size = 40) {
  if (au.avatar_url) {
    return '<img class="avatar-img" src="' + au.avatar_url + '" alt="' + au.name + '" width="' + size + '" height="' + size + '" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;object-fit:cover;flex-shrink:0">';
  }
  return '<span class="avatar avatar--dark" style="width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * 0.42) + 'px" aria-hidden="true">' + au.name.charAt(0) + '</span>';
}

/* ---- article card (image-led) ----
   variant driven by html[data-card]; markup is shared, CSS reflows it. */
function cardHTML(a, opts = {}) {
  const cat = CAT_OF(a);
  const au = AUTHOR_OF(a);
  const tags = a.tags.slice(0, opts.maxTags ?? 3);
  return `
  <article class="pcard" data-cat="${a.category}">
    <a class="pcard__link" href="${articleUrl(a)}" aria-label="${a.title}">
      <span class="pcard__thumb">
        <img src="${coverOf(a)}" alt="" loading="lazy" width="1600" height="900" />
        <span class="pcard__cat eyebrow">${cat.name}</span>
      </span>
      <span class="pcard__body">
        <span class="pcard__kicker eyebrow">${cat.name}</span>
        <h3 class="pcard__title">${a.title}</h3>
        <p class="pcard__excerpt">${a.excerpt}</p>
        <span class="pcard__tags">${tags.map((t) => `<span class="ptag">${t}</span>`).join("")}</span>
        <span class="pcard__foot">
          <span class="avatar" style="width:24px;height:24px;font-size:11px;font-weight:700"></span>
          <span class="pcard__who">
            <span class="pcard__by">AUCTORITAS</span>
          </span>
          <span class="pcard__metaline"><time datetime="${a.date}">${fmtDate(a.date, "short")}</time><span class="dotsep" aria-hidden="true">·</span>${a.reading}분</span>
        </span>
      </span>
    </a>
  </article>`;
}

/* expose */
if (typeof window !== "undefined") {
  Object.assign(window, {
    SITE, AUTHORS, CATEGORIES, ARTICLES, ICON,
    AUTHOR_OF, CAT_OF, fmtDate, byNewest, relatedTo, articleUrl, coverOf, avatarHTML, cardHTML,
    authorUrl, articlesByAuthor, authorPostCount, authorSpecialties, authorsBySeniority, authorAvatarHTML,
  });
}
