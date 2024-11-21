import styles from "@/styles/Events.module.scss";
import { withAuth } from "@/utils/auth";
import type { NextPage } from 'next';
import Navbar from "./layout/navbar";

const Events: NextPage = () => {
  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <h1>Events Page</h1>
        <p>Explore all the free food events happening on campus.</p>

        <button className={styles.addButton} onClick={() => alert("Add Event clicked!")}>
          Add Event
        </button>
      </main>
    </div>
  );
}

export default withAuth(Events);
