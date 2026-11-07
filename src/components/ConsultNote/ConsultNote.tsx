import { ICON } from '@/utils/icons';
import styles from './styles.css';

function ConsultNote() {
  return (
    <aside className={styles.root}>
      <div className={styles.text}>
        <div className={styles.title}>떼인 돈, 포기하지 않아도 돼요.</div>
        <div className={styles.desc}>
          빌려준 돈, 보증금, 공사·용역대금처럼 받지 못한 돈이 있다면
          비사이드(VESIDE)에서 질문에 답하며 지급명령신청서·소장 초안을
          온라인으로 만들어 보세요.
        </div>
      </div>
      <a
        className={styles.btn}
        href="https://veside.us"
        target="_blank"
        rel="noopener noreferrer"
      >
        무료로 시작하기{' '}
        <span dangerouslySetInnerHTML={{ __html: ICON.arrow }} />
      </a>
    </aside>
  );
}

export default ConsultNote;
