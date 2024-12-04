import styles from "@/styles/Home.module.scss";
import Image from 'next/image';
import { useState, useEffect } from "react";
import { auth, rtdb } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/router";
import { useAuth } from "@/utils/auth";
import type { NextPage } from 'next';
import { ref, get } from 'firebase/database';

const Home: NextPage = () => {
  const [signedIn, setSignedIn] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    const checkUser = async () => {
      if (user) {
        // Check if user exists in rtdb
        const userRef = ref(rtdb, `users/${user.uid}`);
        try {
          const snapshot = await get(userRef);
          if (!snapshot.exists()) {
            router.replace('/signup');
          } else {
            router.replace('/home');
          }
        } catch (error) {
          console.error("Error checking user data:", error);
        }
      }
    };

    if (!loading) {
      checkUser();
    }
  }, [user, loading, router]);

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      
      // Check if email ends with bu.edu
      if (!email?.endsWith('@bu.edu')) {
        await auth.signOut(); // Sign out the user immediately
        alert('Only Boston University email addresses (@bu.edu) are allowed to sign up.');
        return; // Return early before any routing occurs
      }
      
      setSignedIn(true);
      
      // Check if user exists in rtdb
      const userRef = ref(rtdb, `users/${result.user.uid}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        router.push('/signup');
      } else {
        router.push('/home');
      }
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
            <div className={styles.aboutSection}>
            <h2>About Spark! Bytes</h2>
            <p>
              Spark! Bytes is a platform designed to help Boston University students find free food on campus.
              Our goal is to reduce food waste while ensuring students have access to resources they need.
              By connecting students with events offering free food, Spark! Bytes fosters a community of sharing
              and sustainability. Sign in to explore available events and join us in making a difference!
            </p>
          </div>
        </div>
    </>
  );
}

export default Home;
