import Link from 'next/link';
import { ICON } from '@/utils/icons';
import styles from './styles.css';

function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.root} id="site-footer">
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div>
            <Link className={styles.brand} href="/">
              AUCTORITAS LAB
            </Link>
            <p className={styles.about}>
              공간분쟁 전문 변호사팀이 직접 쓰는 판례·실무 저널.
              공사대금·부동산·임대차 등 공간을 둘러싼 분쟁을 판례와 실무
              기준으로 기록합니다.
            </p>
            <p className={styles.quote}>공간을 둘러싼 분쟁, 법으로 풀어내다.</p>
          </div>
          <div className={styles.col}>
            <h4>저널</h4>
            <div className={styles.contact}>
              <Link href="/">홈</Link>
              <Link href="/authors">집필진</Link>
              <a
                href="https://instagram.com/auctoritas_journal"
                target="_blank"
                rel="noopener"
              >
                <span dangerouslySetInnerHTML={{ __html: ICON.insta }} />
                <span>@auctoritas_journal</span>
              </a>
              <a
                href="https://fightingspirit.kr"
                target="_blank"
                rel="noopener"
              >
                <span dangerouslySetInnerHTML={{ __html: ICON.link }} />
                <span>fightingspirit.kr</span>
              </a>
            </div>
          </div>
          <div className={styles.col}>
            <h4>문의</h4>
            <div className={styles.contact}>
              <a href="tel:0315463997">
                <span dangerouslySetInnerHTML={{ __html: ICON.phone }} />
                <span>031-546-3997</span>
              </a>
              <span>
                <span dangerouslySetInnerHTML={{ __html: ICON.phone }} />
                <span>031-546-3998 (FAX)</span>
              </span>
              <a href="mailto:info@fightingspirit.kr">
                <span dangerouslySetInnerHTML={{ __html: ICON.mail }} />
                <span>info@fightingspirit.kr</span>
              </a>
              <span>
                <span dangerouslySetInnerHTML={{ __html: ICON.pin }} />
                <span>
                  경기도 수원시 영통구 광교중앙로 248번길 7-2 원희캐슬법조타운
                  B동 401호
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>
          © {year} AUCTORITAS LAB. 본 저널의 글은 일반적 정보 제공을 목적으로
          하며, 개별 사안에 대한 법률자문을 대체하지 않습니다.
        </span>
      </div>
    </footer>
  );
}

export default SiteFooter;
