import styles from "@/styles/Events.module.scss";
import { withAuth } from "@/utils/auth";
import type { NextPage } from 'next';
import Navbar from "../layout/navbar";
import { useState, useEffect } from 'react';
import { rtdb } from "@/lib/firebase";
import { ref, push, get, query, orderByChild, set } from "firebase/database";
import { useAuth } from "@/utils/auth";

interface EventForm {
  location: string;
  food: string;
  date: string;
  extraInfo: string;
}

interface Event extends EventForm {
  id: string;
  creator: string;
  createdAt: string;
}

const Events: NextPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [formData, setFormData] = useState<EventForm>({
    location: '',
    food: '',
    date: '',
    extraInfo: ''
  });
  const { user } = useAuth();

  // Fetch events when component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch events from Firebase Realtime Database
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const eventsRef = ref(rtdb, 'events');
      const eventsQuery = query(eventsRef, orderByChild('date'));
      const snapshot = await get(eventsQuery);
      
      if (snapshot.exists()) {
        const eventsData: Event[] = [];
        snapshot.forEach((childSnapshot) => {
          eventsData.push({
            id: childSnapshot.key as string,
            ...childSnapshot.val()
          });
        });
        eventsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setEvents(eventsData);
      } else {
        setEvents([]);
        console.log('No events found in database');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
      alert('Error loading events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const eventsRef = ref(rtdb, 'events');
      const newEventRef = push(eventsRef);
      const eventId = newEventRef.key;
      
      // Create the event
      await set(newEventRef, {
        ...formData,
        creator: user?.uid,
        createdAt: new Date().toISOString()
      });

      // Update user's events array
      const userRef = ref(rtdb, `users/${user?.uid}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();
      
      await set(userRef, {
        ...userData,
        events: [...(userData.events || []), eventId]
      });

      setFormData({
        location: '',
        food: '',
        date: '',
        extraInfo: ''
      });
      setShowForm(false);
      fetchEvents(); 
      alert('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    } finally {
      setIsSubmitting(false);
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
        <h1>Events Page</h1>
        <p>Explore all the free food events happening on campus.</p>

        <button 
          className={styles.addButton} 
          onClick={() => setShowForm(!showForm)}
          disabled={isSubmitting}
        >
          {showForm ? 'Cancel' : 'Add Event'}
        </button>

        {showForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.eventForm}>
              <button 
                className={styles.closeButton}
                onClick={() => setShowForm(false)}
                type="button"
              >
                ×
              </button>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="location">Location:</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="food">Food:</label>
                  <input
                    type="text"
                    id="food"
                    name="food"
                    value={formData.food}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="date">Date:</label>
                  <input
                    type="datetime-local"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="extraInfo">Additional Information:</label>
                  <textarea
                    id="extraInfo"
                    name="extraInfo"
                    value={formData.extraInfo}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </div>

                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Event...' : 'Create Event'}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className={styles.eventsContainer}>
          <h2>Upcoming Events</h2>
          {isLoading ? (
            <div className={styles.loading}>Loading events...</div>
          ) : events.length > 0 ? (
            <div className={styles.eventsList}>
              {events.map((event) => (
                <div key={event.id} className={styles.eventCard}>
                  <h3>{event.food}</h3>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p><strong>Date:</strong> {formatDate(event.date)}</p>
                  {event.extraInfo && (
                    <p><strong>Additional Info:</strong> {event.extraInfo}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noEvents}>No events found</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default withAuth(Events);