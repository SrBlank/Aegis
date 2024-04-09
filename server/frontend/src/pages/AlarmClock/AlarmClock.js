// AlarmClock.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import axios from 'axios'; 
import AlarmList from './AlarmList';
import AddAlarmDialog from './AddAlarmDialog';
import EditAlarmDialog from './EditAlarmDialog';

const AlarmClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarms, setAlarms] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const url = "http://localhost:3001/api/alarmclock/alarms";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchAlarms();
    return () => clearInterval(timer);
  }, []);

  const fetchAlarms = async () => {
      try {
          const response = await axios.get(url);
          const fetchedAlarms = response.data;

          const sortedAlarms = fetchedAlarms.sort((a, b) => {
              const timeA = new Date('1970/01/01 ' + a.time);
              const timeB = new Date('1970/01/01 ' + b.time);
              return timeA - timeB;
          });

          setAlarms(sortedAlarms);
      } catch (error) {
          console.error('Error fetching alarms:', error);
      }
  };

  const handleAddAlarm = async (newAlarm) => {
    try {
        const response = await axios.post(url, newAlarm);
        const addedAlarm = response.data;

        const updatedAlarms = [...alarms, addedAlarm].sort((a, b) => {
            const timeA = new Date('1970/01/01 ' + a.time);
            const timeB = new Date('1970/01/01 ' + b.time);
            return timeA - timeB;
        });

        setAlarms(updatedAlarms);
        setIsAddOpen(false);
    } catch (error) {
        console.error('Error adding alarm:', error);
    }
};

  const handleDeleteAlarm = async (id) => {
    console.log("Trying to Delete Alarm ", id)
    try {
        await axios.delete(`${url}/${id}`);
        setAlarms(alarms.filter(alarm => alarm._id !== id));
    } catch (error) {
        console.error('Error deleting alarm:', error);
    }
};

const handleToggleAlarm = async (id) => {
  try {
      const response = await axios.patch(`${url}/${id}/toggle`);
      const toggledAlarm = response.data;

      // Update the alarm state in the local state
      const updatedAlarms = alarms.map(alarm => {
          if (alarm._id === id) {
              return toggledAlarm;
          }
          return alarm;
      });

      setAlarms(updatedAlarms);
  } catch (error) {
      console.error('Error toggling alarm:', error);
  }
};

  return (
    <Box>
      <Typography variant="h2" align="center" gutterBottom>
        {currentTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })}
      </Typography>
      <AlarmList alarms={alarms} onToggleAlarm={handleToggleAlarm} />
      <Button onClick={() => setIsAddOpen(true)}>Add Alarm</Button>
      <Button onClick={() => setIsEditOpen(true)}>Edit Alarms</Button>
      <AddAlarmDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAddAlarm={handleAddAlarm} />
      <EditAlarmDialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} alarms={alarms} onDeleteAlarm={handleDeleteAlarm} />
    </Box>
  );
};

export default AlarmClock;
