import styles from "@/styles/Home.module.scss";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default function Home() {
  const [signedIn, setSignedIn] = useState(false);

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setSignedIn(true);
    } catch (error) {
      // TODO: Add error handling
      console.error("Error signing in with Google:", error);
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
        </div>
      ) : (
        <div>
          {/*Signed in page*/}
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
