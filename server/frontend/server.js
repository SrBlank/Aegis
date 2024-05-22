const express = require('express');
const path = require('path');
const app = express();
const config = require('../../config.json');

// change to reactPort for production
//react-scripts build && node server.js
const port = config.reactServerPort; 

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// The "catchall" handler: for any request that doesn't match one above, send back index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(port, () => {
  console.log(`Frontend server running on port ${port}`);
});
