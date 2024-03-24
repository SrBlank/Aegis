import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    pallete: {
        type: 'dark',
        primary: {
            main: '#90caf9',
        },
        secondary: {
            main: '#f48fb1',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
    },
});

export default theme;