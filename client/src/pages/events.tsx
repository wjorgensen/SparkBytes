import Link from "next/link";
import styles from "@/styles/Events.module.scss"; // Assuming you have an Events.module.scss file for styling

export default function Events() {
  return (
    <div className={styles.container}>
      {/* Navigation Bar */}
      <nav className={styles.navbar}>
        <ul className={styles.navList}>
          <li>
            <Link href="/">Home</Link>
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
        <h1>Events Page</h1>
        <p>Explore all the free food events happening on campus.</p>

        {/* Add Event Button */}
        <button className={styles.addButton} onClick={() => alert("Add Event clicked!")}>
          Add Event
        </button>
      </main>
    </div>
  );
}
