import styles from "@/styles/Home.module.scss";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { rtdb } from "@/lib/firebase";
import { ref, set, get, child } from "firebase/database";
import { useRouter } from "next/router"; // Import useRouter for navigation

export default function Home() {
  const [signedIn, setSignedIn] = useState(false);
  const [events, setEvents] = useState(null);
  const router = useRouter(); // Initialize useRouter

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setSignedIn(true);
      router.push("/home"); // Redirect to the home page
    } catch (error) {
      // TODO: Add error handling
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
            extraInfo: "Free for all students"
          }
        }
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
      const snapshot = await get(child(dbRef, '/'));
      
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

  // TODO: Add check to see if user is a BU email
  return (
    <>
      {/* Not signed in page */}
      {signedIn ? (
        <div>
          <h1>Spark! Bytes</h1>
          <p>Welcome to Spark! Bytes</p>
          <div style={{ marginTop: '20px' }}>
            <button onClick={postSampleData} style={{ marginRight: '10px' }}>
              Post Sample Data
            </button>
            <button onClick={fetchAllData}>
              Fetch All Data
            </button>
          </div>
          {events && (
            <div style={{ marginTop: '20px' }}>
              <h2>Current Data:</h2>
              <pre>{JSON.stringify(events, null, 2)}</pre>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h1>Spark! Bytes</h1>
          <p>Find free food on BU campus</p>
          <button onClick={signInWithGoogle}>
            Sign in with Google
          </button>
        </div>
      )}
    </>
  );
}
