import { withAuth } from "@/utils/auth";
import styles from "@/styles/Listing.module.scss";
import { useRouter } from "next/router";
import type { NextPage } from 'next';
import Navbar from "../../layout/navbar";

const Listing: NextPage = () => {
  const router = useRouter();
  const { uid } = router.query;

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <h1>Listing Details</h1>
        <p>Listing ID: {uid}</p>
        {/* Add listing content here */}
      </main>
    </div>
  );
}

export default withAuth(Listing);
