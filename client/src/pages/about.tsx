import Link from "next/link";
import styles from "@/styles/About.module.scss";

export default function About() {
    return (
      <div className={styles.container}>
        {/* Navigation Bar */}
        <nav className={styles.navbar}>
          <ul className={styles.navList}>
            <li>
              <Link href="/home">Home</Link>
            </li>
            <li>
              <Link href="/events">Events</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/profile">Profile</Link>
            </li>
          </ul>
        </nav>
  
        {/* Main Content */}
        <main className={styles.about}>
          <h1>We are Spark! Bytes</h1>
          <p>Discover free food and events happening on the BU campus.</p>
        </main>
      </div>
    );
  }