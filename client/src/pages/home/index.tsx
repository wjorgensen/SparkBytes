import Link from "next/link";
import styles from "@/styles/Home.module.scss";
import { withAuth } from "@/utils/auth";
import type { NextPage } from 'next';
import Navbar from "../layout/navbar";
import Image from 'next/image'
import { APIProvider, Map } from '@vis.gl/react-google-maps';

/**
 * Home Component
 * 
 * This component serves as the main landing page for the application.
 * It includes a navigation bar, a welcome message, a map displaying
 * the location of events, and a logo.
 * 
 * @component
 * @returns {JSX.Element} The rendered Home component.
 */
const Home: NextPage = () => {
  return (
    <>
    <div className={styles.container}>
      {/* Render the navigation bar */}
      <Navbar />
      <main className={styles.main}>
        {/* Main heading for the page */}
        <h1>Welcome to Spark! Bytes</h1>
        {/* Description of the application */}
        <p>Discover free food and events happening on the BU campus.</p>
        
        <div className={styles.mapContainer}>
          {/* APIProvider wraps the Map component to provide the Google Maps API key */}
          <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <Map
              defaultCenter={{ lat: 42.3505, lng: -71.1054 }} 
              defaultZoom={15}
              style={{ width: '100%', height: '400px' }}
            />
          </APIProvider>
        </div>
      </main>
      
      <div className={styles.logoContainer}>
        {/* Logo image for the application */}
        <Image
          src="/spark.png"
          alt="Spark Bytes Logo"
          width={400}
          height={400}
        />
      </div>
    </div>
    </>
  );
}

// Export the Home component wrapped with authentication
export default withAuth(Home); 