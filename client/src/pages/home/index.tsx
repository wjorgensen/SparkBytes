import Link from "next/link";
import styles from "@/styles/Home.module.scss";
import { withAuth } from "@/utils/auth";
import type { NextPage } from 'next';
import Navbar from "../layout/navbar";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <h1>Welcome to Spark! Bytes</h1>
        <p>Discover free food and events happening on the BU campus.</p>
      </main>
    </div>
  );
}

export default withAuth(Home); 