import Link from "next/link";
import styles from "@/styles/About.module.scss";
import Navbar from "../layout/navbar";

export default function About() {
    return (
      <div className={styles.container}>
        <Navbar />
        <main className={styles.about}>
          <h1>We are Spark! Bytes</h1>
          <p>Discover free food and events happening on the BU campus.</p>
        </main>
      </div>
    );
  } 