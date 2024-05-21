// src/components/AddDeviceDialog.js
import React, { useState, useEffect } from 'react';
import {
  TextField, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  CircularProgress, Box, Stepper, Step, StepLabel, Typography, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AddDeviceDialog = ({ open, onClose, onError }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [deviceName, setDeviceName] = useState('');
  const [configOptions, setConfigOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');

  const steps = ['Select Device', 'Device Configuration', 'Finalize'];

  useEffect(() => {
    if (open) {
      fetchDevices();
    }
  }, [open]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/devices/available');
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

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!selectedDevice) {
        onError('Please select a device.');
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/devices/connect/${selectedDevice}`);
        if (response.ok) {
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } else {
          onError('Error connecting to device.');
        }
      } catch (error) {
        onError('Error connecting to device.');
      } finally {
        setLoading(false);
      }
    } else if (activeStep === 1) {
      if (!deviceName) {
        onError('Please provide a display name for the device.');
        return;
      }
      setLoading(true);
      const selectedDeviceName = devices.find(device => device._id === selectedDevice)?.name;
      try {
        const response = await fetch(`http://localhost:3001/api/devices/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: selectedDeviceName, dispName: deviceName, connected: true }),
        });
        if (response.ok) {
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } else {
          onError('Error updating device name.');
        }
      } catch (error) {
        onError('Error updating device name.');
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleClose = () => {
    onClose();
    setActiveStep(0);
    setDeviceName('');
    setConfigOptions([]);
    setSelectedDevice('');
  };

  const handleDeviceSelect = (event) => {
    setSelectedDevice(event.target.value);
  };

  const handleDeviceNameChange = (event) => {
    setDeviceName(event.target.value);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        Add New Device
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === 0 && (
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
                    <MenuItem key={device._id} value={device._id}>
                      {device.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        )}
        {activeStep === 1 && (
          <Box sx={{ mt: 2 }}>
            <Typography>Configure Device: {selectedDevice && devices.find(device => device._id === selectedDevice)?.name}</Typography>
            <TextField
              fullWidth
              label="Display Name"
              value={deviceName}
              onChange={handleDeviceNameChange}
              sx={{ mt: 2 }}
            />
            {configOptions.map((option, index) => (
              <TextField
                key={index}
                fullWidth
                label={option}
                sx={{ mt: 2 }}
              />
            ))}
          </Box>
        )}
        {activeStep === 2 && (
          <Box sx={{ mt: 2 }}>
            <Typography>Device setup complete. Click "Finish" to close.</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
        <Button onClick={activeStep === steps.length - 1 ? handleClose : handleNext}>
          {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </DialogActions>
      {loading && <CircularProgress />}
    </Dialog>
  );
};

export default AddDeviceDialog;
