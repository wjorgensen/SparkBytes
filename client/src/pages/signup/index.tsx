import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/utils/auth';
import { rtdb } from '@/lib/firebase';
import { ref, set } from 'firebase/database';
import styles from './Signup.module.scss';

interface UserPreferences {
  name: string;
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

/**
 * Signup Component
 * 
 * This component allows users to complete their profile by providing their name
 * and dietary preferences. It handles form submission and validation, and saves
 * the data to the Firebase real-time database.
 * 
 * @component
 * @returns {JSX.Element} The rendered Signup component.
 */
export default function Signup() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<UserPreferences>({
    name: '',
    dietary: {
      none: false,
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      nutFree: false,
    },
    events: []
  });

  /**
   * Handles changes in input fields.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the input.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'none') {
        // If "none" is checked, uncheck all other options
        setFormData(prev => ({
          ...prev,
          dietary: {
            none: checked,
            vegetarian: false,
            vegan: false,
            glutenFree: false,
            dairyFree: false,
            nutFree: false,
          }
        }));
      } else {
        // If any other option is checked, uncheck "none"
        setFormData(prev => ({
          ...prev,
          dietary: {
            ...prev.dietary,
            [name]: checked,
            none: false
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  /**
   * Validates the form data before submission.
   * 
   * @returns {boolean} - Returns true if the form is valid, otherwise false.
   */
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }

    const hasDietaryPreference = Object.values(formData.dietary).some(value => value);
    if (!hasDietaryPreference) {
      setError('Please select at least one dietary preference');
      return false;
    }

    setError('');
    return true;
  };

  /**
   * Handles form submission.
   * 
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const userRef = ref(rtdb, `users/${user.uid}`);
      await set(userRef, {
        ...formData,
        email: user.email,
        createdAt: new Date().toISOString()
      });
      
      router.push('/home');
    } catch (error) {
      console.error('Error saving user preferences:', error);
      setError('Error saving preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1>Complete Your Profile</h1>
        <p>Please tell us a bit about yourself</p>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Dietary Preferences *</label>
            <div className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  name="none"
                  checked={formData.dietary.none}
                  onChange={handleInputChange}
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
                      name={pref}
                      checked={formData.dietary[pref as keyof typeof formData.dietary]}
                      onChange={handleInputChange}
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
            {isSubmitting ? 'Saving...' : 'Complete Signup'}
          </button>
        </form>
      </div>
    </div>
  );
}

