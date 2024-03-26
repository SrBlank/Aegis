// AlarmList.js
import React from 'react';
import { List, ListItem, ListItemText, ListItemSecondaryAction, Switch } from '@mui/material';

const AlarmList = ({ alarms, onToggleAlarm }) => {
  const formatAlarmTime = (timeString) => {
    // Check if the string is in HH:mm format
    if (timeString && /^\d{2}:\d{2}$/.test(timeString)) {
      const [hour, minute] = timeString.split(':').map(Number);
      const time = new Date();
      time.setHours(hour, minute, 0);
      return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    return 'Set Time'; // Return a default message if the time is not set
  };

  return (
    <List>
      {alarms.map((alarm) => (
        <ListItem key={alarm.id} divider>
          <ListItemText
            primary={formatAlarmTime(alarm.time)}
            secondary={alarm.days || 'No Repeat'} // Show 'No Repeat' if days are not set
          />
          <ListItemSecondaryAction>
            <Switch
              edge="end"
              onChange={() => onToggleAlarm(alarm.id)}
              checked={alarm.active}
            />
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default AlarmList;
