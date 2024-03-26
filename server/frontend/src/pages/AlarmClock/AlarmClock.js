// AlarmClock.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import AlarmList from './AlarmList';
import AddAlarmDialog from './AddAlarmDialog';
import EditAlarmDialog from './EditAlarmDialog';

const AlarmClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarms, setAlarms] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleAlarm = (id) => {
    setAlarms(alarms.map(alarm => {
      if (alarm.id === id) {
        return { ...alarm, active: !alarm.active };
      }
      return alarm;
    }));
  };

  const handleAddAlarm = (newAlarm) => {
    setAlarms([...alarms, { ...newAlarm, id: Date.now() }]); // Using the current timestamp for a unique ID
    setIsAddOpen(false);
  };

  const handleDeleteAlarm = (id) => {
    setAlarms(alarms.filter(alarm => alarm.id !== id));
    // Do not close the edit dialog here, remove setIsEditOpen(false)
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
