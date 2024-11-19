import Link from "next/link";
import styles from "@/styles/Home.module.scss"; // Assuming you have a Home.module.scss file for styling

export default function Home() {
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
      <main className={styles.main}>
        <h1>Welcome to Spark! Bytes</h1>
        <p>Discover free food and events happening on the BU campus.</p>
      </main>
    </div>
  );
}
