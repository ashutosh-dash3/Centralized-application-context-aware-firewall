# Application-Level Endpoint Firewall with Central Management

A complete MVP implementation of an endpoint firewall system with centralized management, featuring real-time monitoring, policy enforcement, and anomaly detection.

## 🚀 Features

### Backend Server
- **Central Management**: Node.js + Express + MongoDB server
- **Real-time Updates**: WebSocket support via Socket.IO
- **Anomaly Detection**: Automatic detection of suspicious activity (>50 requests/minute)
- **RESTful API**: Clean, well-documented endpoints
- **Data Models**: Endpoints, Application Logs, Policies

### Endpoint Agent
- **Lightweight Monitoring**: Runs on Windows, monitors network activity every 10 seconds
- **Application Detection**: Uses ps-list to identify running applications
- **Network Monitoring**: Tracks outgoing connections using netstat
- **Policy Enforcement**: Enforces allow/block rules locally
- **Retry Mechanism**: Exponential backoff for failed API calls

### Frontend Dashboard
- **React + Tailwind CSS**: Modern, responsive UI
- **Real-time Dashboard**: Charts, statistics, and live updates
- **Log Viewer**: Filterable table with pagination
- **Policy Management**: Create/edit firewall rules
- **Endpoint Monitor**: View all connected devices

---

## 📁 Project Structure

```
Final Project/
├── backend/                 # Central management server
│   ├── config/             # Database configuration
│   ├── models/             # Mongoose models
│   ├── controllers/        # Business logic
│   ├── routes/             # API routes
│   ├── middleware/         # Error handling
│   └── server.js           # Main entry point
│
├── agent/                  # Endpoint monitoring agent
│   ├── index.js            # Main entry point
│   ├── monitor.js          # Network monitoring
│   ├── policyManager.js    # Policy enforcement
│   └── apiClient.js        # Backend API client
│
└── frontend/               # React dashboard
    ├── src/
    │   ├── components/     # Reusable components
    │   ├── pages/          # Application pages
    │   └── services/       # API services
    └── public/
```

---

## 🛠️ Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** (optional) - [Download](https://git-scm.com/)

---

### Step 1: Install MongoDB

**Windows:**
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. MongoDB will start automatically as a Windows service

**Verify MongoDB is running:**
```bash
mongosh
```

You should see the MongoDB shell connect successfully.

---

### Step 2: Set Up Backend

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/endpoint-firewall
NODE_ENV=development
```

**Start the backend server:**

```bash
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Endpoint Firewall Management Server                     ║
║                                                           ║
║   Server running on port 5000                             ║
║   Environment: development                                ║
║   WebSocket: Enabled                                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

MongoDB Connected: localhost
```

**Test the backend:**
Open your browser and go to `http://localhost:5000` - you should see the API welcome message.

---

### Step 3: Set Up Endpoint Agent

Open a **new terminal window** and navigate to the agent directory:

```bash
cd agent
npm install
```

Create a `.env` file in the `agent` directory:

```bash
BACKEND_URL=http://localhost:5000
MONITORING_INTERVAL=10000
POLICY_REFRESH_INTERVAL=60000
```

**Start the agent:**

```bash
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Endpoint Firewall Agent                                 ║
║                                                           ║
║   Device ID: DESKTOP-ABC123                               ║
║   Hostname: DESKTOP-ABC123                                ║
║   Backend: http://localhost:5000                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

[Agent] Initialization complete ✓
[Agent] Starting endpoint firewall agent...
```

The agent will now:
- Monitor network activity every 10 seconds
- Send logs to the backend
- Fetch and enforce policies

---

### Step 4: Set Up Frontend Dashboard

Open a **new terminal window** and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```bash
VITE_API_URL=http://localhost:5000/api
```

**Start the development server:**

```bash
npm run dev
```

You should see:
```
  VITE v4.4.9  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Open the dashboard:**
Go to `http://localhost:5173` in your browser.

You should see the dashboard with:
- Total endpoints count
- Active endpoints
- Total logs collected
- Anomaly detection stats

---

## 🎯 Usage Guide

### 1. View Dashboard
- Navigate to `http://localhost:5173`
- See overview statistics and charts
- View recent suspicious activity

### 2. Monitor Logs
- Click "Logs" in the sidebar
- Filter by application name, status, or anomalies
- Use pagination to browse through logs

### 3. Create Firewall Policies
- Click "Policies" in the sidebar
- Click "+ Create New Policy"
- Fill in the form:
  - **Device**: Select target device
  - **Application**: e.g., `chrome.exe`, `spotify.exe`
  - **Allowed Domains**: e.g., `*.google.com`
  - **Blocked Domains**: e.g., `malware.com`
  - **Allowed IPs**: e.g., `192.168.1.0/24`
  - **Blocked IPs**: e.g., `10.0.0.1`
- Click "Create Policy"

### 4. Manage Endpoints
- Click "Endpoints" in the sidebar
- View all registered devices
- Activate/deactivate endpoints
- Monitor last seen timestamps

---

## 🔧 Configuration

### Backend Configuration (`backend/.env`)

```bash
PORT=5000                        # Server port
MONGODB_URI=mongodb://localhost:27017/endpoint-firewall  # MongoDB connection string
NODE_ENV=development             # Environment mode
```

### Agent Configuration (`agent/.env`)

```bash
BACKEND_URL=http://localhost:5000          # Backend server URL
MONITORING_INTERVAL=10000                  # Monitor every 10 seconds
POLICY_REFRESH_INTERVAL=60000              # Refresh policies every 60 seconds
```

### Frontend Configuration (`frontend/.env`)

```bash
VITE_API_URL=http://localhost:5000/api     # Backend API URL
```

---

## 📊 API Endpoints

### Logs
- `POST /api/logs` - Submit logs from agent
- `GET /api/logs` - Get logs with filters
- `GET /api/logs/stats` - Get log statistics

### Policies
- `GET /api/policies/:deviceId` - Get policies for device
- `POST /api/policies` - Create/update policy
- `GET /api/policies` - Get all policies
- `DELETE /api/policies/:id` - Delete policy

### Endpoints
- `POST /api/endpoints` - Register endpoint
- `GET /api/endpoints` - List all endpoints
- `GET /api/endpoints/:deviceId` - Get specific endpoint
- `PUT /api/endpoints/:deviceId/status` - Update status

---

## 🔍 Testing the System

### Test 1: Verify Agent is Working
1. Open the dashboard
2. Go to "Endpoints" page
3. You should see your device listed

### Test 2: View Live Logs
1. Keep the agent running
2. Go to "Logs" page
3. Watch as new logs appear every 10 seconds

### Test 3: Create a Blocking Policy
1. Go to "Policies" page
2. Create a policy for `chrome.exe`
3. Add `example.com` to blocked domains
4. When chrome.exe connects to example.com, it will be logged as "blocked"

### Test 4: Trigger Anomaly Detection
1. The agent collects logs every 10 seconds
2. If an app makes >50 requests in 60 seconds, it's flagged as anomalous
3. View anomalies on the "Logs" page (filter by Anomaly = Yes)

---

## 🐛 Troubleshooting

### MongoDB Connection Error
**Problem:** Backend fails to connect to MongoDB
**Solution:** 
```bash
# Check if MongoDB is running
net start | findstr MongoDB

# Start MongoDB manually (if not running)
net start MongoDB
```

### Port Already in Use
**Problem:** Port 5000 or 5173 is already in use
**Solution:** Change the port in the respective `.env` file:
```bash
# Backend
PORT=5001

# Frontend (vite.config.js)
server: { port: 5174 }
```

### Agent Not Connecting
**Problem:** Agent can't reach backend
**Solution:** 
- Verify backend is running on `http://localhost:5000`
- Check `BACKEND_URL` in agent's `.env` file
- Ensure no firewall is blocking the connection

### Frontend Not Loading Data
**Problem:** Dashboard shows empty data
**Solution:**
- Ensure backend is running
- Check browser console for errors
- Verify `VITE_API_URL` in frontend's `.env`

---

## 📝 Notes

### MVP Limitations
- **Application-level only**: This is not a kernel-level firewall
- **Logging vs Blocking**: MVP logs blocked connections but doesn't actually block them at OS level
- **Windows-focused**: Agent uses Windows-specific commands (netstat)
- **No Authentication**: Dashboard is open (add JWT auth for production)

### Future Enhancements
- Kernel-level packet filtering
- DNS query monitoring
- Real-time WebSocket log streaming
- Advanced anomaly detection (ML-based)
- User authentication and authorization
- Audit logging
- Export reports (CSV/PDF)

---

## 🎓 Learning Resources

### Technologies Used
- **Backend**: Node.js, Express, MongoDB, Socket.IO
- **Frontend**: React, Tailwind CSS, Recharts, React Router
- **Agent**: Node.js, ps-list, axios

### Architecture Patterns
- RESTful API design
- MVC pattern (Models, Controllers, Routes)
- Pub/Sub with WebSocket
- Retry mechanism with exponential backoff

---

## 📄 License

This project is created for educational purposes. Feel free to use and modify as needed.

---

## 👨‍💻 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check MongoDB and server logs

---

**Built with ❤️ as a complete MVP demonstration**
