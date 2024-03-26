import React, { useState, useEffect } from 'react';
import { Typography, CircularProgress } from '@mui/material';

// Component for displaying the details of a specific device
export default function DeviceDetails({ deviceId }) {
  const [deviceData, setDeviceData] = useState(null); // State to hold device data
  const [loading, setLoading] = useState(true); // State to manage loading status

  useEffect(() => {
    // Fetch data when the component mounts or deviceId changes
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate fetching data for the device
        const data = await getDeviceData(deviceId);
        setDeviceData(data); // Set the fetched data into state
      } catch (error) {
        console.error("Error fetching device data: ", error); // Handle any errors during fetch
      }
      setLoading(false); // Set loading to false once data is fetched
    };

    fetchData();
  }, [deviceId]); // Dependency array, re-run effect if deviceId changes

  if (loading) {
    return <CircularProgress />; // Show a loading indicator while data is being fetched
  }

  return (
    <div>
      <Typography variant="h5">Details for Device {deviceId}</Typography>
      {/* Render more device-specific details and controls here */}
    </div>
  );
}

// Simulated function to mimic data fetching from an API
async function getDeviceData(deviceId) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(`Data for device ${deviceId}`), 1000);
  });
}
