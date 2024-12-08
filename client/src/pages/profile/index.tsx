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
  createdAt?: string;
}

interface UserData {
  name: string;
  email: string;
  dietary: {
    none: boolean;
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    nutFree: boolean;
  };
  events: string[];
}

interface EventFormData {
  location: string;
  food: string;
  date: string;
  extraInfo: string;
}

interface ProfileFormData {
  name: string;
  email: string;
  dietary: {
    none: boolean;
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    nutFree: boolean;
  };
}

/**
 * Profile Component
 * 
 * This component displays the user's profile information, allows editing of user details,
 * and manages the user's events (creation, editing, and deletion).
 * 
 * @component
 * @returns {JSX.Element} The rendered Profile component.
 */
const Profile: NextPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EventFormData>({
    location: '',
    food: '',
    date: '',
    extraInfo: ''
  });
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: '',
    email: '',
    dietary: {
      none: false,
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      nutFree: false,
    }
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        const userRef = ref(rtdb, `users/${user.uid}`);
        const snapshot = await get(userRef);
        const data = snapshot.val();
        setUserData(data);
        setProfileForm({
          name: data.name,
          email: data.email,
          dietary: data.dietary
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!user) return;
      
      try {
        const userRef = ref(rtdb, `users/${user.uid}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
        
        if (userData?.events) {
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
      router.push('/'); 
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user) return;
    
    try {
      const eventRef = ref(rtdb, `events/${eventId}`);
      await remove(eventRef);

      const userRef = ref(rtdb, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();
      
      const updatedEvents = userData.events.filter((id: string) => id !== eventId);
      await set(userRef, {
        ...userData,
        events: updatedEvents
      });

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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingEvent) return;

    try {
      const eventRef = ref(rtdb, `events/${editingEvent.id}`);
      await set(eventRef, {
        ...editForm,
        creator: user.uid,
        createdAt: editingEvent.createdAt || new Date().toISOString()
      });

      setUserEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === editingEvent.id
            ? { ...event, ...editForm }
            : event
        )
      );

      setShowEventForm(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Error updating event. Please try again.');
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEditForm({
      location: event.location,
      food: event.food,
      date: event.date,
      extraInfo: event.extraInfo || ''
    });
    setShowEventForm(true);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name.startsWith('dietary.')) {
      const dietaryKey = name.split('.')[1];
      setProfileForm(prev => ({
        ...prev,
        dietary: {
          ...prev.dietary,
          [dietaryKey]: checked,
          ...(dietaryKey !== 'none' && checked ? { none: false } : {}),
          ...(dietaryKey === 'none' && checked ? {
            vegetarian: false,
            vegan: false,
            glutenFree: false,
            dairyFree: false,
            nutFree: false,
          } : {})
        }
      }));
    } else {
      setProfileForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const userRef = ref(rtdb, `users/${user.uid}`);
      await set(userRef, {
        ...userData,
        name: profileForm.name,
        email: profileForm.email,
        dietary: profileForm.dietary
      });

      setUserData(prev => prev ? ({
        ...prev,
        name: profileForm.name,
        email: profileForm.email,
        dietary: profileForm.dietary
      }) : null);

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <h1>Profile Page</h1>
        
        <div className={styles.profileSection}>
          {!isEditing ? (
            <div className={styles.profileDetails}>
              <h2>Your Details</h2>
              <p><strong>Name:</strong> {userData?.name}</p>
              <p><strong>Email:</strong> {userData?.email}</p>
              <div className={styles.dietaryPreferences}>
                <strong>Dietary Preferences:</strong>
                <ul>
                  {userData?.dietary && Object.entries(userData.dietary)
                    .filter(([_, value]) => value)
                    .map(([pref]) => (
                      <li key={pref}>
                        {pref.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </li>
                    ))}
                </ul>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className={styles.editButton}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className={styles.editForm}>
              <h2>Edit Profile</h2>
              <div className={styles.formGroup}>
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Dietary Preferences</label>
                <div className={styles.checkboxGroup}>
                  {Object.entries(profileForm.dietary).map(([pref, checked]) => (
                    <label key={pref}>
                      <input
                        type="checkbox"
                        name={`dietary.${pref}`}
                        checked={checked}
                        onChange={handleProfileChange}
                        disabled={pref !== 'none' && profileForm.dietary.none}
                      />
                      {pref.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.editButtons}>
                <button type="submit" className={styles.saveButton}>
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEditing(false);
                    setProfileForm({
                      name: userData?.name || '',
                      email: userData?.email || '',
                      dietary: userData?.dietary || {
                        none: false,
                        vegetarian: false,
                        vegan: false,
                        glutenFree: false,
                        dairyFree: false,
                        nutFree: false,
                      }
                    });
                  }}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className={styles.profileContent}>
          {loading ? (
            <p className={styles.loading}>Loading your events...</p>
          ) : userEvents.length > 0 ? (
            <div className={styles.eventsContainer}>
              <h2>Your Events</h2>
              <div className={styles.eventsList}>
                {userEvents.map(event => (
                  <div key={event.id} className={styles.eventCard}>
                    <div className={styles.eventActions}>
                      <button
                        onClick={() => handleEditEvent(event)}
                        className={styles.editEventButton}
                        aria-label="Edit event"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className={styles.deleteButton}
                        aria-label="Delete event"
                      >
                        Delete
                      </button>
                    </div>
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
      {showEventForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.eventForm}>
            <button 
              className={styles.closeButton}
              onClick={() => {
                setShowEventForm(false);
                setEditingEvent(null);
              }}
              type="button"
            >
              ×
            </button>
            <form onSubmit={handleEditSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="location">Location:</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={editForm.location}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="food">Food:</label>
                <input
                  type="text"
                  id="food"
                  name="food"
                  value={editForm.food}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="date">Date and Time:</label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={editForm.date}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="extraInfo">Additional Information:</label>
                <textarea
                  id="extraInfo"
                  name="extraInfo"
                  value={editForm.extraInfo}
                  onChange={handleEditChange}
                />
              </div>

              <div className={styles.editButtons}>
                <button type="submit" className={styles.saveButton}>
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEventForm(false);
                    setEditingEvent(null);
                  }}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(Profile);
