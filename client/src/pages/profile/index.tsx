import { useState, useEffect } from 'react';
import { withAuth } from "@/utils/auth";
import styles from "@/styles/Profile.module.scss";
import type { NextPage } from 'next';
import { auth, rtdb } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import Navbar from "../layout/navbar";
import { ref, get, remove, set } from "firebase/database";
import { useAuth } from "@/utils/auth";

interface Event {
  id: string;
  location: string;
  food: string;
  date: string;
  extraInfo: string;
}

const Profile: NextPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!user) return;
      
      try {
        // Get user data to get event IDs
        const userRef = ref(rtdb, `users/${user.uid}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
        
        if (userData?.events) {
          // Fetch each event
          const eventPromises = userData.events.map(async (eventId: string) => {
            const eventRef = ref(rtdb, `events/${eventId}`);
            const eventSnapshot = await get(eventRef);
            return { id: eventId, ...eventSnapshot.val() };
          });
          
          const events = await Promise.all(eventPromises);
          setUserEvents(events);
        }
      } catch (error) {
        console.error('Error fetching user events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Redirect to landing page after sign out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user) return;
    
    try {
      // Delete the event from events node
      const eventRef = ref(rtdb, `events/${eventId}`);
      await remove(eventRef);

      // Update user's events array
      const userRef = ref(rtdb, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();
      
      const updatedEvents = userData.events.filter((id: string) => id !== eventId);
      await set(userRef, {
        ...userData,
        events: updatedEvents
      });

      // Update local state
      setUserEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <h1>Profile Page</h1>
        <div className={styles.profileContent}>
          {loading ? (
            <p className={styles.loading}>Loading your events...</p>
          ) : userEvents.length > 0 ? (
            <div className={styles.eventsContainer}>
              <h2>Your Events</h2>
              <div className={styles.eventsList}>
                {userEvents.map(event => (
                  <div key={event.id} className={styles.eventCard}>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className={styles.deleteButton}
                      aria-label="Delete event"
                    >
                      ×
                    </button>
                    <h3>{event.food}</h3>
                    <p><strong>Location:</strong> {event.location}</p>
                    <p><strong>Date:</strong> {formatDate(event.date)}</p>
                    {event.extraInfo && (
                      <p><strong>Additional Info:</strong> {event.extraInfo}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className={styles.noEvents}>You haven't created any events yet.</p>
          )}
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
