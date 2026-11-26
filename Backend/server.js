const pool = require('./config/db');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// Generate virtual sensor readings
function generateSensorData() {

    return {
        temperature: Math.floor(Math.random() * 16) + 20,
        humidity: Math.floor(Math.random() * 41) + 40,
        motion: Math.random() > 0.5
    };

}

// Store latest sensor reading
let sensorData = generateSensorData();




// Existing health API
app.get('/api/health', (req, res) => {
    res.json({
        message: 'Smart Home Backend is running!',
        status: 'Success'
    });
});

// Sensor API
app.get('/api/sensor-data', (req, res) => {
    res.json(sensorData);
});

// Socket.IO connection
io.on('connection', (socket) => {

    console.log('Frontend connected:', socket.id);

    // Send current readings to newly connected client
    socket.emit('sensor-update', sensorData);

    socket.on('disconnect', () => {
        console.log('Frontend disconnected:', socket.id);
    });

});


setInterval(async () => {
    try {

        // 1. Generate new sensor readings
        sensorData = generateSensorData();

        // Save sensor readings into MySQL
    await pool.query(
        `INSERT INTO sensor_data
        (temperature, humidity, motion)
        VALUES (?, ?, ?)`,
        [
            sensorData.temperature,
            sensorData.humidity,
            sensorData.motion
        ]
    );
    console.log('Sensor data saved to MySQL!');

        // 2. Determine the required fan status
        const newFanStatus = sensorData.temperature > 30 ? 1 : 0;

        // 3. Get the current fan record from MySQL
        const [fanRows] = await pool.query(
            'SELECT id, status FROM devices WHERE type = ?',
            ['fan']
        );

        // 4. Check whether the fan exists
        if (fanRows.length > 0) {

            const fan = fanRows[0];

            // 5. Update MySQL only if the fan status changes
            if (Number(fan.status) !== newFanStatus) {

                await pool.query(
                    'UPDATE devices SET status = ? WHERE id = ?',
                    [newFanStatus, fan.id]
                );

                console.log(
                    'Automatic Fan Control:',
                    newFanStatus === 1 ? 'ON' : 'OFF'
                );

                // 6. Fetch the latest device records
                const [updatedDevices] = await pool.query(
                    'SELECT * FROM devices'
                );

                // 7. Broadcast the actual database records
                io.emit('devices-update', updatedDevices);
            }
        }

        // 8. Broadcast sensor readings
        io.emit('sensor-update', sensorData);

        console.log('New sensor data:', sensorData);

    } catch (error) {
        console.error('Automatic fan control error:', error);
    }

}, 3000);


// Get all devices using SQL query
app.get('/api/devices', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM devices');

        res.status(200).json(rows);

    } catch (error) {
        console.error('Error fetching devices:', error);

        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Previously stored sensor readings in Sql data:
app.get('/api/sensor-history', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT * FROM sensor_data
             ORDER BY created_at DESC
             LIMIT 100`
        );

        res.status(200).json(rows);

    } catch (error) {
        console.error('Error fetching sensor history:', error);

        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Update device status

app.patch('/api/devices/:id', async (req, res) => {
    try {
        // 1. Extract device ID from URL parameters
        const deviceId = Number(req.params.id);

        // 2. Extract status from request body
        const { status } = req.body;

        // 3. Validate device ID
        if (!Number.isInteger(deviceId) || deviceId <= 0) {
            return res.status(400).json({
                message: 'Invalid device ID'
            });
        }

        // 4. Validate status
        if (typeof status !== 'boolean') {
            return res.status(400).json({
                message: 'Status must be true or false'
            });
        }

        // 5. Check whether device exists in MySQL
        const [existingDevice] = await pool.query(
            'SELECT * FROM devices WHERE id = ?',
            [deviceId]
        );

        if (existingDevice.length === 0) {
            return res.status(404).json({
                message: 'Device not found'
            });
        }

        // 6. Update device status in MySQL
        await pool.query(
            'UPDATE devices SET status = ? WHERE id = ?',
            [status, deviceId]
        );

        // 7. Fetch all updated devices
        const [rows] = await pool.query(
            'SELECT * FROM devices'
        );

        // 8. Broadcast updated devices through Socket.IO
        io.emit('devices-update', rows);

        // 9. Send response
        res.status(200).json({
            message: 'Device status updated successfully',
            device: rows.find(device => device.id === deviceId)
        });

    } catch (error) {
        console.error('Error updating device:', error);

        res.status(500).json({
            message: 'Internal server error'
        });
    }
});


// DATABASE connection check and Start server

async function startServer() {
    try {
        await pool.query('SELECT 1');

        console.log('MySQL connected successfully!');

        server.listen(5000, () => {
            console.log('Server running on port 5000');
        });

    } catch (error) {
        console.error('MySQL connection failed:', error.message);
        process.exit(1);
    }
}

startServer();

