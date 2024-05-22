const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('../../config.json');
const { spawn } = require('child_process');

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
const availableDevicesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Device name is required']
  }
});

const deviceSchema = new mongoose.Schema({ 
    name: {
      type: String,
    },
    dispName:{
      type: String,
      default: ""
    },
    lastHeartbeat: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline'
    },
    connected: {
      type: Boolean,
      default: false
    }
});

const Alarm = mongoose.model('Alarm', alarmSchema);
const Device = mongoose.model('Device', deviceSchema);
const Available = mongoose.model('Available', availableDevicesSchema);
const HEARTBEAT_THRESHOLD = 30 * 1000; //config.heartbeatCheckSec * 1000; 

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
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

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

app.get('/api/devices/available', async (req, res) => {
  try {
    const devices = await Available.find();
    res.json(devices);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching devices' });
  }
});

app.get('/api/devices/connect/:name', async(req, res) => {
  try {
    /*
    const runPythonScript = () => {
      return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', ['connectToAP.py']);

        pythonProcess.stdout.on('data', (data) => {
          console.log(`Output: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
          console.error(`Error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Python script finished with code ${code}`));
          }
        });
      });
    };

    await runPythonScript();
    */
    return res.status(200).send({ message: 'Python script executed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error executing Python script' });
  }
});

app.post('/api/devices/available', async (req, res) => {
  try {
    const avail = new Available(req.body);
    await avail.save();
    res.status(201).send(avail);
  } catch (error) {
    res.status(500).send({ message: 'Error creating device' });
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

app.patch('/api/devices/heartbeat/:dispName', async (req, res) => {
  try {
    const device = await Device.findOneAndUpdate(
      { dispName: req.params.dispName }, // Use dispName to find the device
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

app.patch('/api/devices/:id', async (req, res) => {
  try {
    const { dispName, connected } = req.body;
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { dispName, connected },
      { new: true }
    );
    if (!device) {
      return res.status(404).send({ message: 'Device not found' });
    }
    res.json(device);
  } catch (error) {
    res.status(500).send({ message: 'Error updating device' });
  }
});

app.delete('/api/devices/dispName/:dispName', async (req, res) => {
  try {
    const result = await Device.findOneAndDelete({ dispName: req.params.dispName });
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

