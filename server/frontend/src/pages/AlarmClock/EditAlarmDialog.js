// EditAlarmDialog.js
import React from 'react';
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, ListItemSecondaryAction, Button, DialogActions } from '@mui/material';

const EditAlarmDialog = ({ isOpen, onClose, alarms, onDeleteAlarm }) => {
  const formatAlarmTime = (timeString) => {
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
    return 'Set Time'; 
  };
  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth>
      <DialogTitle>Edit/Delete Alarm</DialogTitle>
      <DialogContent>
        <List>
          {alarms.map((alarm) => (
            <ListItem key={alarm.id} divider>
              <ListItemText
                primary={formatAlarmTime(alarm.time)}
                secondary={alarm.days.length > 0 ? alarm.days.join(', ') : 'No Repeat'}
                />
              <ListItemSecondaryAction>
                <Button color="secondary" onClick={() => onDeleteAlarm(alarm._id)}>
                  Delete
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditAlarmDialog;
