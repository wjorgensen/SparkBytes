import { withAuth } from "@/utils/auth";
import styles from "@/styles/Profile.module.scss";
import type { NextPage } from 'next';
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import Navbar from "../layout/navbar";

const Profile: NextPage = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Redirect to landing page after sign out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <h1>Profile Page</h1>
        <div className={styles.profileContent}>
          {/* Add profile content here */}
        </div>
        
        <button 
          onClick={handleSignOut}
          className={styles.signOutButton}
        >
          Sign Out
        </button>
      </main>
    </div>
  );
}

export default withAuth(Profile);
