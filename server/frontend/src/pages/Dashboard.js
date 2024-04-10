import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AppBar, Tabs, Tab, Box, Grid, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, Alert } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import DeviceCard from './DeviceCard';

const Alarm = lazy(() => import('./AlarmClock/AlarmClock'));
const Weather = lazy(() => import('./WeatherStation')); 

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/devices');
        const data = await response.json();
        setDevices(data);
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    if (activeTab === 0) { // Only fetch devices when on the Home tab
      fetchDevices();
    }
  }, [activeTab]); // Add activeTab as a dependency  

  const goHome = () => () => {
    setActiveTab(0);
  };

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {['Account', 'Notifications', 'Add New Device'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['Settings'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const renderTabContent = () => {
    if (activeTab === 0) {
      return (
        <Grid container spacing={2}>
          {devices.map((device, index) => (
            <Grid item xs={12} sm={6} md={4} key={device._id}>
              <DeviceCard device={device} onClick={() => setActiveTab(index + 1)} />
            </Grid>
          ))}
        </Grid>
      );
    } else {
      const device = devices[activeTab - 1];
      if (!device) return null;

      // Check the device status and show an alert if offline
      if (device.status === 'offline') {
        return <Alert severity="error">Device {device.name} is offline</Alert>;
      }

      switch (device.name) {
        case 'Alarm Clock':
          return (
            <Suspense fallback={<div>Loading...</div>}>
              <Alarm />
            </Suspense>
          );
        case 'Weather Station':
          return (
            <Suspense fallback={<div>Loading...</div>}>
              <Weather />
            </Suspense>
          );
        default:
          return null;
      }
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" aria-label="menu" edge="start" sx={{ mr: 2 }} onClick={goHome()}>
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            IoT Dashboard
          </Typography>
          <IconButton color="inherit" aria-label="menu" edge="start" sx={{ mr: 2 }} onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <Drawer open={open} onClose={toggleDrawer(false)} anchor="right">
              {DrawerList}
          </Drawer>
        </Toolbar>
        <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)} aria-label="Device Tabs">
          <Tab label='Home' />
          {devices.map((device, index) => (
            <Tab label={device.name} key={device.id} />
          ))}
        </Tabs>
      </AppBar>
      <Box sx={{ p: 3 }}>
        {renderTabContent()}
      </Box>
    </>
  );
}
