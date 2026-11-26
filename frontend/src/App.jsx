import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./app.css";

const API = "http://localhost:5000";

function App() {
  const [sensorData, setSensorData] = useState(null);
  const [devices, setDevices] = useState([]);
  const [sensorHistory, setSensorHistory] = useState([]);

  // Socket.IO connection and device fetching
  useEffect(() => {
    const socket = io(API);

    socket.on("sensor-update", (data) => {
      setSensorData(data);
    });

    socket.on("devices-update", (data) => {
      setDevices(data);
    });

    axios
      .get(`${API}/api/devices`)
      .then((response) => {
        setDevices(response.data);
      })
      .catch((error) => {
        console.error("Error fetching devices:", error);
      });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch sensor history
  useEffect(() => {
    const fetchSensorHistory = async () => {
      try {
        const response = await axios.get(`${API}/api/sensor-history`);

        setSensorHistory([...response.data].reverse());
      } catch (error) {
        console.error("Error fetching sensor history:", error);
      }
    };

    fetchSensorHistory();

    const interval = setInterval(fetchSensorHistory, 3000);

    return () => clearInterval(interval);
  }, []);

  // Control devices
  const toggleDevice = async (device) => {
    try {
      await axios.patch(`${API}/api/devices/${device.id}`, {
        status: !device.status,
      });
    } catch (error) {
      console.error("Device control error:", error);
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Smart Home Automation</h1>
          <p>Monitor and manage your home devices</p>
        </div>

        <div className="connection-status">
          <span className="status-dot"></span>
          Live Monitoring
        </div>
      </header>

      <main className="dashboard-content">
        {/* Sensor Section */}
        <section className="dashboard-section">
          <div className="section-heading">
            <h2>Live Sensor Dashboard</h2>
            <p>Current environmental readings</p>
          </div>

          <div className="sensor-grid">
            <div className="sensor-card">
              <p className="card-label">Temperature</p>
              <h3>{sensorData ? `${sensorData.temperature}°C` : "--"}</h3>
              <span>Current temperature</span>
            </div>

            <div className="sensor-card">
              <p className="card-label">Humidity</p>
              <h3>{sensorData ? `${sensorData.humidity}%` : "--"}</h3>
              <span>Current humidity</span>
            </div>

            <div className="sensor-card">
              <p className="card-label">Motion Detection</p>
              <h3 className="motion-value">
                {sensorData
                  ? sensorData.motion
                    ? "Detected"
                    : "Not Detected"
                  : "--"}
              </h3>
              <span>Current motion status</span>
            </div>
          </div>
        </section>

        {/* Device Controls */}
        <section className="dashboard-section">
          <div className="section-heading">
            <h2>Smart Device Controls</h2>
            <p>Manage your connected home devices</p>
          </div>

          <div className="device-grid">
            {devices.map((device) => (
              <div className="device-card" key={device.id}>
                <div className="device-info">
                  <h3>{device.name}</h3>
                  <span className="device-type">{device.type}</span>
                </div>

                <div className="device-status">
                  <span
                    className={
                      device.status === 1
                        ? "status-badge on"
                        : "status-badge off"
                    }
                  >
                    {device.status === 1 ? "ON" : "OFF"}
                  </span>
                </div>

                <button
                  className={
                    device.status === 1
                      ? "device-button turn-off"
                      : "device-button turn-on"
                  }
                  onClick={() => toggleDevice(device)}
                >
                  Turn {device.status === 1 ? "OFF" : "ON"}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Temperature History */}
        <section className="dashboard-section chart-container">
          <div className="section-heading">
            <h2>Temperature History</h2>
            <p>Historical temperature readings</p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sensorHistory}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="created_at"
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />

              <YAxis
                domain={["auto", "auto"]}
                label={{
                  value: "Temperature (°C)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />

              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#2563eb"
                name="Temperature"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </main>

      <footer className="dashboard-footer">Smart Home Automation System</footer>
    </div>
  );
}

export default App;
