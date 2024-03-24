import React from 'react';
import { Link } from 'react-router-dom';
import styled, { withTheme } from 'styled-components';
import { List, ListItem, ListItemText, Paper, Typography} from '@mui/material';

const HomePage = () => {
    const devices = [
        {id: 1, name: 'Alarm Clock', status: 'Online'},
        {id: 2, name: 'Weather Station', status: 'Offline'},
    ];

    return (
        <Paper elevation={3} style={{margin: '20px', padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                IoT Device Dashboard
            </Typography>
            <List>
                {devices.map(device => (
                    <ListItem button component={Link} to={`/device/${device.id}`} key={device.id}>
                        <ListItemText  primary={device.name}/>
                        <StatusIndicator isOnline={device.status === 'Online'} />
                    </ListItem>
                ))}
            </List>
        </Paper>
 
    );
};

const StatusIndicator = styled.span`
    height: 10px;
    width: 10px;
    border-radius: 50%;
    background-color: ${props => (props.isOnline ? 'green' : 'red')};
`;

export default HomePage;