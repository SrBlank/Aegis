import React, { useState, Suspense, lazy } from 'react';
import { AppBar, Tabs, Tab, Box, Grid, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider} from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import DeviceCard from './DeviceCard';

// Lazy load device components
const Alarm = lazy(() => import('./AlarmClock/AlarmClock'));
const Weather = lazy(() => import('./WeatherStation')); 

// Devices array to be replaced by API
const devices = [
  { id: 1, name: 'Alarm Clock', status: 'Online' },
  { id: 2, name: 'Weather Station', status: 'Offline' },
  { id: 3, name: 'Camera', status: 'Online'},
];

// Dashboard component definition
export default function Dashboard() {
  // State hook for activeTab, initialized to 0 (the home tab)
  const [activeTab, setActiveTab] = useState(0);
  const [open, setOpen] = useState(false);

  const goHome = () => () => {
    setActiveTab(0);
  };

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  // Drawer Configuration
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
              {/*<ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>*/}
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  // Function to render the content based on the active tab
  const renderTabContent = () => {
    if (activeTab === 0) { // Check if the home tab is active
      return (
        <Grid container spacing={2}>
          {devices.map((device, index) => (
            <Grid item xs={12} sm={6} md={4} key={device.id}>
              <DeviceCard device={device} onClick={() => setActiveTab(index + 1)} />
            </Grid>
          ))}
        </Grid>
      );
    } else {
      const device = devices[activeTab - 1]; // for tabs other than the home find the corresponding device

      switch (device.id) { // return the corresponding component
        case 1:
          return ( // Suspense and lazy loading are used to dynamically load the component
            <Suspense fallback={<div>Loading...</div>}>
              <Alarm />
            </Suspense>
          );
        case 2:
          return (
            <Suspense fallback={<div>Loading...</div>}>
              <Weather />
            </Suspense>
          );
        default:
          return null; // Return null if no matching device is found
      }
    }
  };

  // Render the dashboard component
  return (
    <>
      {/* AppBar for the header */} 
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" aria-label="menu" edge="start" sx={{ mr: 2 }} onClick={goHome()}>
            <HomeIcon />
          </IconButton>
          {/* Title of the dashboard */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            IoT Dashboard
          </Typography>
          {/* Menu icon in the AppBar */}
          <IconButton color="inherit" aria-label="menu" edge="start" sx={{ mr: 2 }} onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <Drawer open={open} onClose={toggleDrawer(false)} anchor="right">
              {DrawerList}
          </Drawer>
        </Toolbar>
        {/* Tabs for navigating between devices */}
        <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)} aria-label="Device Tabs">
          <Tab label='Home' />
          {devices.map((device, index) => (
            <Tab label={device.name} key={device.id} />
          ))}
        </Tabs>
      </AppBar>
      {/* Box containing the content rendered based on the active tab */}
      <Box sx={{ p: 3 }}>
        {renderTabContent()}
      </Box>
    </>
  );
}
