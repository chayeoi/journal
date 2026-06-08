import { ICON } from "@/utils/icons";
import styles from "./styles.css";

function ConsultNote() {
  return (
    <aside className={styles.root}>
      <div className={styles.text}>
        <div className={styles.title}>떼인 돈, 포기하지 않아도 돼요.</div>
        <div className={styles.desc}>
          공사대금, 보증금, 월세 등으로 받지 못한 돈이 있다면
          FENCIL의 간편한 청구 절차로 법원에 청구해 보세요.
        </div>
      </div>
      <a
        className={styles.btn}
        href="https://fencil.app"
        target="_blank"
        rel="noopener"
      >
        무료로 시작하기{" "}
        <span dangerouslySetInnerHTML={{ __html: ICON.arrow }} />
      </a>
    </aside>
  );
}

export default ConsultNote;
