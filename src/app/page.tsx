"use client";

import styles from "./page.module.css";

export default function Page() {
  return (
    <>
      <nav className={styles.nav}>
        <span className={styles.logo}>NubeLab</span>
        <ul className={styles.links}>
          <li><a href="#">Systems</a></li>
          <li><a href="#">Infra</a></li>
          <li><a href="#">Lab</a></li>
          <li><a href="#">About</a></li>
        </ul>
      </nav>
      <section className={styles.hero}>
        <h1>Operational Systems Platform</h1>
        <p>A cloud lab for systems, infrastructure and operations</p>
      </section>
    </>
  );
}
