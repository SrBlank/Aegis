// EditAlarmDialog.js
import React from 'react';
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, ListItemSecondaryAction, Button, DialogActions } from '@mui/material';

const EditAlarmDialog = ({ isOpen, onClose, alarms, onDeleteAlarm }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth>
      <DialogTitle>Edit/Delete Alarm</DialogTitle>
      <DialogContent>
        <List>
          {alarms.map((alarm) => (
            <ListItem key={alarm.id} divider>
              <ListItemText
                primary={new Date(alarm.time).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
                secondary={alarm.days}
              />
              <ListItemSecondaryAction>
                <Button color="secondary" onClick={() => onDeleteAlarm(alarm.id)}>
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
