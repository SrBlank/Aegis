const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('../../config.json');

// Connect to MongoDB
mongoose.connect(config.mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

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

// Define a schema for devices
const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Device name is required']
  },
  lastHeartbeat: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  }
});

const Alarm = mongoose.model('Alarm', alarmSchema);
const Device = mongoose.model('Device', deviceSchema)
const HEARTBEAT_THRESHOLD = 30 * 1000;//2 * 60 * 1000; // 2 minutes in milliseconds

setInterval(async () => {
  try {
    const devices = await Device.find({ status: 'online' }); // Only check devices that are currently online
    const now = new Date();

    for (const device of devices) {
      if (now - new Date(device.lastHeartbeat).getTime() > HEARTBEAT_THRESHOLD) {
        device.status = 'offline';
        await device.save();
      }
    }
  } catch (error) {
    console.error('Error updating device statuses', error);
  }
}, HEARTBEAT_THRESHOLD);


const app = express();
app.use(bodyParser.json());
app.use(cors());

/*                 */
/* Alarm Clock API */
/*                 */
app.get('/api/alarmclock/alarms', async (req, res) => {
  const alarms = await Alarm.find();
  res.json(alarms);
});

app.post('/api/alarmclock/alarms', async (req, res) => {
  const alarm = new Alarm(req.body);
  await alarm.save();
  res.status(201).send(alarm);
});

app.get('/api/alarmclock/alarms/:id', async (req, res) => {
  const alarm = await Alarm.findById(req.params.id);
  res.json(alarm);
});

app.put('/api/alarmclock/alarms/:id', async (req, res) => {
  const alarm = await Alarm.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(alarm);
});

app.delete('/api/alarmclock/alarms/:id', async (req, res) => {
  await Alarm.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

app.patch('/api/alarmclock/alarms/:id/toggle', async (req, res) => {
  try {
    const alarm = await Alarm.findById(req.params.id);
    if (!alarm) {
      return res.status(404).send({ message: 'Alarm not found' });
    }
    alarm.active = !alarm.active;  // Toggle the active status
    await alarm.save();
    res.json(alarm);
  } catch (error) {
    res.status(500).send({ message: 'Error toggling alarm status' });
  }
});

/*            */
/* Device API */
/*            */
app.get('/api/devices', async (req, res) => {
  try {
    const devices = await Device.find();
    res.json(devices);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching devices' });
  }
});

app.get('/api/devices/status/:name', async (req, res) => {
  try {
    const device = await Device.findOne({ name: req.params.name });
    if (!device) {
      return res.status(404).send({ message: 'Device not found' });
    }
    res.json({ status: device.status });
  } catch (error) {
    res.status(500).send({ message: 'Error fetching device status' });
  }
});

app.post('/api/devices', async (req, res) => {
  try {
    const device = new Device(req.body);
    await device.save();
    res.status(201).send(device);
  } catch (error) {
    res.status(500).send({ message: 'Error creating device' });
  }
});

app.patch('/api/devices/heartbeat/:name', async (req, res) => {
  try {
    const device = await Device.findOneAndUpdate(
      { name: req.params.name }, // Use name to find the device
      {
        lastHeartbeat: Date.now(),
        status: 'online'  
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).send({ message: 'Device not found' });
    }
    res.json(device);
  } catch (error) {
    res.status(500).send({ message: 'Error updating device heartbeat' });
  }
});


app.delete('/api/devices/:id', async (req, res) => {
  try {
    const result = await Device.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).send({ message: 'Device not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).send({ message: 'Error deleting device' });
  }
});

// Start the server
const port = config.expressPort 
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});

