const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/aegisDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Define a schema for the alarm 
const alarmSchema = new mongoose.Schema({
  time: {
    type: String,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format!`
    },
    required: [true, 'Time for the alarm is required']
  },
  days: {
    type: [String],
    enum: ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa', 'None'],
    required: true
  },
  sound: {
    type: String,
    required: [true, 'Sound for the alarm is required']
  },
  active: {
    type: Boolean,
    required: [true, 'Alarm status (active or not) is required']
  }
});

const Alarm = mongoose.model('Alarm', alarmSchema);

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Define the API endpoints
app.get('/api/alarms', async (req, res) => {
  const alarms = await Alarm.find();
  res.json(alarms);
});

app.post('/api/alarms', async (req, res) => {
  const alarm = new Alarm(req.body);
  await alarm.save();
  res.status(201).send(alarm);
});

app.get('/api/alarms/:id', async (req, res) => {
  const alarm = await Alarm.findById(req.params.id);
  res.json(alarm);
});

app.put('/api/alarms/:id', async (req, res) => {
  const alarm = await Alarm.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(alarm);
});

app.delete('/api/alarms/:id', async (req, res) => {
  await Alarm.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// Start the server
const port = 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://10.0.0.8:${port}`);
});