import styles from "@/styles/Home.module.scss";
import Image from 'next/image';
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { rtdb } from "@/lib/firebase";
import { ref, set, get, child } from "firebase/database";
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

  // Function to post sample data
  const postSampleData = async () => {
    try {
      const sampleData = {
        events: {
          eventId1: {
            location: "Library Cafe",
            food: "Pizza and Salad",
            date: "2024-03-15",
            creator: "user123",
            extraInfo: "Free for all students",
          },
        },
      };

      await set(ref(rtdb), sampleData);
      alert("Data posted successfully!");
    } catch (error) {
      console.error("Error posting data:", error);
      alert("Error posting data");
    }
  };

  // Function to fetch all data
  const fetchAllData = async () => {
    try {
      const dbRef = ref(rtdb);
      const snapshot = await get(child(dbRef, "/"));

      if (snapshot.exists()) {
        const data = snapshot.val();
        setEvents(data);
        console.log("Retrieved data:", data);
      } else {
        console.log("No data available");
        setEvents(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <>
      {signedIn ? (
        <div className={styles.container}>
          <h1>Spark! Bytes</h1>
          <p>Welcome to Spark! Bytes</p>
          <div className={styles.actionButtons}>
            <button onClick={postSampleData}>Post Sample Data</button>
            <button onClick={fetchAllData}>Fetch All Data</button>
          </div>
          {events && (
            <div className={styles.events}>
              <h2>Current Data:</h2>
              <pre>{JSON.stringify(events, null, 2)}</pre>
            </div>
          )}
        </div>
      ) : (
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
              src="/logo.png" // The path to your logo in the public folder
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
        
        
      
      )}
    </>
  );
}

export default Home;
