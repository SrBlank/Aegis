import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, FormControl, FormGroup, FormControlLabel, Checkbox, Snackbar, Alert
} from '@mui/material';

const AddAlarmDialog = ({ isOpen, onClose, onAddAlarm }) => {
  const [newAlarmTime, setNewAlarmTime] = useState('');
  const [newAlarmDays, setNewAlarmDays] = useState([]);
  const [newAlarmSound, setNewAlarmSound] = useState('Beep');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const daysOfWeek = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];
  const sounds = ['Beep', 'Chime', 'Ringtone']; 

  const handleDayChange = (day) => {
    setNewAlarmDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleAddClick = () => {
    if (!newAlarmTime) {
      setSnackbarOpen(true);
      return;
    }

    onAddAlarm({
      time: newAlarmTime,
      days: newAlarmDays,
      sound: newAlarmSound,
      active: true
    });
    
    // Reset the fields
    setNewAlarmTime('');
    setNewAlarmDays([]);
    setNewAlarmSound('Beep');
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose}>
        <DialogTitle>Add Alarm</DialogTitle>
        <DialogContent>
          <TextField
            label="Time"
            type="time"
            fullWidth
            value={newAlarmTime}
            onChange={(e) => setNewAlarmTime(e.target.value)}
            InputLabelProps={{
              style: { top: '6px' },
              shrink: true,
            }}
          />
          <FormControl component="fieldset" style={{ marginTop: '10px' }}>
            <FormGroup row>
              {daysOfWeek.map(day => (
                <FormControlLabel
                  key={day}
                  control={
                    <Checkbox
                      checked={newAlarmDays.includes(day)}
                      onChange={() => handleDayChange(day)}
                    />
                  }
                  label={day}
                />
              ))}
            </FormGroup>
          </FormControl>
          <TextField
            select
            label="Sound"
            value={newAlarmSound}
            onChange={(e) => setNewAlarmSound(e.target.value)}
            fullWidth
          >
            {sounds.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleAddClick}>Add</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
          Please set the time for the alarm.
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddAlarmDialog;
