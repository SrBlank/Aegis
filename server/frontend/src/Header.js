import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
//import App from './App';
//import './Header.css'; 

const Header = () => {
    return(
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6">IoT Device Dashboard</Typography>
            </Toolbar>
        </AppBar>
    );
}

export default Header;