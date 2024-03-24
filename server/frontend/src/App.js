
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import HomePage from './pages/HomePage';
//import DevicePage from './pages/DevicePage'; 

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/*<Route path="/device/:id" component={DevicePage} />*/}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
