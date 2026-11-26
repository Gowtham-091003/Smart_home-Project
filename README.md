# Smart Home Automation System

A full-stack IoT-based Smart Home Automation System built using **React.js, Node.js, Express.js, MySQL and Socket.IO**. This project simulates real-time sensor monitoring and intelligent device automation through a web-based dashboard without requiring physical IoT hardware.

## Project Overview

The Smart Home Automation System allows users to monitor simulated environmental sensor readings and control home appliances through a responsive web dashboard.

The backend continuously generates sensor readings, stores historical data in MySQL, and automatically controls the virtual fan based on temperature conditions. Socket.IO enables real-time communication between the backend and frontend.

## Key Features

- **Live Sensor Monitoring:** Displays real-time temperature, humidity and motion detection readings.
- **Automatic Fan Control:** Automatically switches the virtual fan ON when temperature exceeds 30°C and OFF when it reaches 30°C or below.
- **Manual Device Control:** Allows users to switch connected virtual devices ON and OFF.
- **Real-Time Communication:** Uses Socket.IO to transmit sensor and device status updates without refreshing the page.
- **MySQL Integration:** Stores device information, device status and historical sensor readings.
- **Temperature History:** Displays historical temperature readings through an interactive line chart.
- **API Validation:** Handles invalid device IDs, incorrect status values and missing devices.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Real-Time Communication | Socket.IO |
| API Integration | Axios, REST APIs |
| Data Visualization | Recharts |
| Development Tools | VS Code, Postman, Git, GitHub |

## System Architecture

```text
          React Frontend
                |
          Axios / REST API
                |
          Node.js + Express
                |
             MySQL
                |
       Sensor Data & Devices

    Socket.IO Communication
       Backend <----> Frontend

    Automatic Fan Automation
    Temperature > 30°C
           |
       Fan ON

    Temperature <= 30°C
           |
       Fan OFF
```

## Database Design

The project uses a MySQL database named `smart_home` with two primary tables.

### 1. devices

Stores connected home device information and their current status.

| Column | Description |
|---|---|
| id | Primary key |
| name | Device name |
| type | Device category |
| status | Device status (0 = OFF, 1 = ON) |

### 2. sensor_data

Stores historical environmental sensor readings.

| Column | Description |
|---|---|
| id | Primary key |
| temperature | Temperature reading |
| humidity | Humidity reading |
| motion | Motion detection status |
| created_at | Sensor reading timestamp |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/devices` | Fetch all devices |
| PATCH | `/api/devices/:id` | Update device status |
| GET | `/api/sensor-data` | Fetch current sensor readings |
| GET | `/api/sensor-history` | Fetch historical sensor readings |

## Real-Time Events

Socket.IO is used for real-time communication.

| Event | Purpose |
|---|---|
| `sensor-update` | Sends updated sensor readings |
| `devices-update` | Sends updated device statuses |

## Installation and Setup

### Prerequisites

Make sure the following are installed:

- Node.js and npm
- MySQL Server
- Git
- Visual Studio Code

### 1. Clone the Repository

```bash
git clone https://github.com/Gowtham-091003/Smart_home-Project.git
```

Navigate into the project:

```bash
cd Smart_home-Project
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd Backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `Backend` folder:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smart_home
PORT=5000
```

Create the `smart_home` database in MySQL and configure the `devices` and `sensor_data` tables using the project database schema.

Start the backend server:

```bash
node server.js
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash