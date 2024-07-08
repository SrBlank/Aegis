// Settings.js
import React, { useState, useEffect } from 'react';
import {
  TextField, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  CircularProgress, Box, Stepper, Step, StepLabel, Typography, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Settings= ({ open, onClose, onError }) => {
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    onClose();
  };


  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        Settings
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography>
            Not sure what to put here yet lol
        </Typography>
      </DialogContent>
      {loading && <CircularProgress />}
    </Dialog>
  );
};

export default Settings;
