import Link from "next/link";
import styles from "@/styles/Home.module.scss";
import { withAuth } from "@/utils/auth";
import type { NextPage } from 'next';
import Navbar from "../layout/navbar";
import Image from 'next/image'

const Home: NextPage = () => {
  return (
    <>
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <h1>Welcome to Spark! Bytes</h1>
        <p>Discover free food and events happening on the BU campus.</p>
      </main>
      <div className={styles.logoContainer}>
            <Image
              src="/spark.png" // The path to your logo in the public folder
              alt="Spark Bytes Logo"
              width={400} // Adjust the width
              height={400} // Adjust the height
              />
            </div>
    </div>
    </>
  );
}

export default withAuth(Home); 