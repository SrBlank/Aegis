// src/components/DeleteDeviceDialog.js
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Box,
  Typography, MenuItem, Select, FormControl, InputLabel, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DeleteDeviceDialog = ({ open, onClose, onError }) => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchDevices();
    }
  }, [open]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/devices');
      if (response.ok) {
        const data = await response.json();
        setDevices(data);
      } else {
        onError('Error fetching devices.');
      }
    } catch (error) {
      onError('Error fetching devices.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/devices/dispName/${selectedDevice}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        handleClose();
      } else {
        onError('Error deleting device.');
      }
    } catch (error) {
      onError('Error deleting device.');
    } finally {
      setLoading(false);
      setConfirmationOpen(false); // Close confirmation dialog after delete attempt
    }
  };

  const handleDeviceSelect = (event) => {
    setSelectedDevice(event.target.value);
  };

  const handleClose = () => {
    onClose();
    setSelectedDevice('');
    setConfirmationOpen(false);
  };

  const handleDeleteClick = () => {
    if (!selectedDevice) {
      onError('Please select a device.');
      return;
    }
    setConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Delete Device
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {loading ? (
              <CircularProgress />
            ) : (
              <FormControl fullWidth>
                <InputLabel id="device-select-label">Select Device</InputLabel>
                <Select
                  labelId="device-select-label"
                  value={selectedDevice}
                  label="Select Device"
                  onChange={handleDeviceSelect}
                >
                  {devices.map((device) => (
                    <MenuItem key={device._id} value={device.dispName}>
                      {device.dispName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDeleteClick} disabled={!selectedDevice}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmationOpen} onClose={handleConfirmationClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Confirm Delete
          <IconButton
            aria-label="close"
            onClick={handleConfirmationClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete the device "{selectedDevice}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmationClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteDeviceDialog;
