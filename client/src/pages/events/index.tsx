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
  campusSection: 'west' | 'central' | 'east';
  dietary: {
    none: boolean;
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    nutFree: boolean;
  };
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
    extraInfo: '',
    campusSection: 'central',
    dietary: {
      none: false,
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      nutFree: false,
    }
  });

  const [filters, setFilters] = useState({
    campusSection: '',
    dietary: {
      none: false,
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      nutFree: false,
    },
  });
  
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
  
    const { name, value } = target;
  
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      const { checked } = target;
      if (name.startsWith('dietary.')) {
        const dietaryOption = name.split('.')[1];
        setFilters(prev => ({
          ...prev,
          dietary: {
            ...prev.dietary,
            [dietaryOption]: checked,
          },
        }));
      }
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  
  const filteredEvents = events.filter(event => {
    const matchesCampus =
      !filters.campusSection || event.campusSection === filters.campusSection;
    const matchesDietary = Object.entries(filters.dietary)
      .filter(([key, value]) => value)
      .every(([key]) => event.dietary[key as keyof typeof event.dietary]); // Use type assertion
    return matchesCampus && matchesDietary;
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
        const now = new Date();
        
        // Get user preferences
        const userRef = ref(rtdb, `users/${user?.uid}`);
        const userSnapshot = await get(userRef);
        const userPreferences = userSnapshot.val()?.dietary || {};
        const hasSpecialDiet = Object.entries(userPreferences)
          .some(([key, value]) => key !== 'none' && value === true);
        
        snapshot.forEach((childSnapshot) => {
          const eventDate = new Date(childSnapshot.val().date);
          const eventData = childSnapshot.val();
          
          // Only add future events that match dietary preferences
          if (eventDate > now) {
            const matchesDietary = hasSpecialDiet
              ? Object.entries(userPreferences)
                  .some(([pref, value]) => 
                    value === true && eventData.dietary[pref] === true)
              : true;
            
            if (matchesDietary) {
              eventsData.push({
                id: childSnapshot.key as string,
                ...eventData
              });
            }
          }
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
        extraInfo: '',
        campusSection: 'central',
        dietary: {
          none: false,
          vegetarian: false,
          vegan: false,
          glutenFree: false,
          dairyFree: false,
          nutFree: false,
        }
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

  const handleDietaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const dietaryOption = name.split('.')[1];

    setFormData(prev => ({
      ...prev,
      dietary: {
        ...prev.dietary,
        ...(dietaryOption === 'none'
          ? {
              none: checked,
              vegetarian: false,
              vegan: false,
              glutenFree: false,
              dairyFree: false,
              nutFree: false,
            }
          : {
              [dietaryOption]: checked,
              none: false,
            }),
      },
    }));
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
                  <label htmlFor="campusSection">Campus Section:</label>
                  <select
                    id="campusSection"
                    name="campusSection"
                    value={formData.campusSection}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="west">West Campus</option>
                    <option value="central">Central Campus</option>
                    <option value="east">East Campus</option>
                  </select>
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
                  <label htmlFor="date">Date and Time:</label>
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

                <div className={styles.formGroup}>
                  <label>Dietary Options:</label>
                  <div className={styles.checkboxGroup}>
                    <label>
                      <input
                        type="checkbox"
                        name="dietary.none"
                        checked={formData.dietary.none}
                        onChange={handleDietaryChange}
                        disabled={isSubmitting}
                      />
                      None
                    </label>
                    {Object.entries(formData.dietary)
                      .filter(([key]) => key !== 'none')
                      .map(([pref]) => (
                        <label key={pref}>
                          <input
                            type="checkbox"
                            name={`dietary.${pref}`}
                            checked={formData.dietary[pref as keyof typeof formData.dietary]}
                            onChange={handleDietaryChange}
                            disabled={isSubmitting || formData.dietary.none}
                          />
                          {pref.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                    ))}
                  </div>
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
        <div className={styles.filterContainer}>
          <h3>Filter Events</h3>
          <div className={styles.filterGroup}>
            <label htmlFor="campusSectionFilter">Campus Section:</label>
            <select
              id="campusSectionFilter"
              name="campusSection"
              value={filters.campusSection}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="west">West Campus</option>
              <option value="central">Central Campus</option>
              <option value="east">East Campus</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Dietary Preferences:</label>
            <div className={styles.checkboxGroup}>
              {Object.entries(filters.dietary).map(([pref, value]) => (
                <label key={pref}>
                  <input
                    type="checkbox"
                    name={`dietary.${pref}`}
                    checked={value}
                    onChange={handleFilterChange}
                  />
                  {pref.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              ))}
            </div>
          </div>
        </div>


        <div className={styles.eventsContainer}>
          <h2>Upcoming Events</h2>
          {isLoading ? (
            <div className={styles.loading}>Loading events...</div>
          ) : events.length > 0 ? (
            <div className={styles.eventsList}>
              {filteredEvents.map((event) => (
                <div key={event.id} className={styles.eventCard}>
                  <h3>{event.food}</h3>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p><strong>Campus Section:</strong> {event.campusSection.charAt(0).toUpperCase() + event.campusSection.slice(1)}</p>
                  <p><strong>Date:</strong> {formatDate(event.date)}</p>
                  <div className={styles.dietaryTags}>
                    {Object.entries(event.dietary)
                      .filter(([key, value]) => key !== 'none' && value)
                      .map(([pref]) => (
                        <span key={pref} className={styles.dietaryTag}>
                          {pref.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      ))}
                  </div>
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