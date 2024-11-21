import styles from "@/styles/Home.module.scss";
import Image from 'next/image';
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/router";
import { useAuth } from "@/utils/auth";
import type { NextPage } from 'next';

const Home: NextPage = () => {
  const [signedIn, setSignedIn] = useState(false);
  const [events, setEvents] = useState(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/home');
    }
  }, [user, router]);

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setSignedIn(true);
      router.push("/home"); // Redirect to the home page
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <>
        <div className={styles.loginContainer}>
          <h1 className={styles.loginHeader}>Spark! Bytes</h1>
          <p className={styles.loginText}>Find free food on BU campus</p>
          <div className={styles.buttonContainer}>
            <button onClick={signInWithGoogle} className={styles.signInButton}>
              Sign in with Google
            </button>
          </div>
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

export default Home;
