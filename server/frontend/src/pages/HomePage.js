import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { List, ListItem, ListItemText, Paper, Typography, Divider} from '@mui/material';


const HomePage = () => {
    const devices = [
        {id: 1, name: 'Alarm Clock', status: 'Online'},
        {id: 2, name: 'Weather Station', status: 'Offline'},
    ];

    return (
        <Paper elevation={3} style={{margin: '20px', padding: '20px', width: '100px', height: '100px'}}>
            <List>
                {devices.map(device => (
                    <ListItem button component={Link} to={`/device/${device.id}`} key={device.id}>
                        <ListItemText  primary={device.name}/>
                        <Divider />
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
    background-color: ${props => (props.isonline ? 'green' : 'red')};
`;
//<StatusIndicator isonline={device.status === 'Online'} />
//   

/*

        
        */

export default HomePage;