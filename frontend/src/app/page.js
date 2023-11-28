"use client";
import styles from "./page.module.css";
import Link from "next/link";
export default function Home() {
  return (
    <main className={styles.main}>
      <h1>lecture examples</h1>
      <menu>
        <li>
          <Link href="./l6">Lecture 6</Link>
        </li>
      </menu>
    </main>
  );
}
