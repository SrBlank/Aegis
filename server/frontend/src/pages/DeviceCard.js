// DeviceCard.js
import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

export default function DeviceCard({ device, onClick }) {
  const onlineStatus = device.status.toLowerCase() === 'online'; // Ensure case-insensitive comparison

  return (
    <Card onClick={() => onClick(device.id)}>
      <CardActionArea>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {device.name}
          </Typography>
          <Box display="flex" alignItems="center">
            <FiberManualRecordIcon
              style={{ fontSize: 14, color: onlineStatus ? 'green' : 'red' }}
            />
            <Typography variant="body2" color="text.secondary" style={{ marginLeft: 4 }}>
              Status: {device.status}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
