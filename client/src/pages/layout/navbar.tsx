import Link from "next/link";
import styles from "@/styles/Home.module.scss";

/**
 * Navbar Component
 * 
 * This component renders the navigation bar for the application.
 * It includes links to the home, events, and profile pages.
 * 
 * @component
 * @returns {JSX.Element} The rendered Navbar component.
 */
const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <ul className={styles.navList}>
        <li>
          <Link href="/home">Home</Link>
        </li>
        <li>
          <Link href="/events">Events</Link>
        </li>
        <li>
          <Link href="/profile">Profile</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
