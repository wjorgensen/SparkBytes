import Link from "next/link";
import styles from "@/styles/Home.module.scss";
import { withAuth } from "@/utils/auth";
import type { NextPage } from 'next';
import Navbar from "../layout/navbar";
import Image from 'next/image'
import { APIProvider, Map } from '@vis.gl/react-google-maps';

const Home: NextPage = () => {
  return (
    <>
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <h1>Welcome to Spark! Bytes</h1>
        <p>Discover free food and events happening on the BU campus.</p>
        
        <div className={styles.mapContainer}>
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

export default withAuth(Home); 