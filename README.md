# Priority Management System

A real-time priority management system with live collaboration features.

## Features

### 🏥 Patient Management
- **Real-time patient intake** with automatic severity assessment
- **Priority-based triage queues** (Critical, High, Medium, Low)
- **Vital signs integration** with automatic severity scoring
- **Patient promotion/demote** in priority queues
- **Search and filter** patients across all queues

### 🏢 Room Management
- **Doctor room assignment** system
- **Automatic patient assignment** to available rooms
- **Real-time room status** updates
- **Patient consultation tracking**

### ⚡ Real-time Features
- **Live updates** via WebSocket connections
- **Multi-user collaboration** with real-time synchronization
- **Connection status indicators** (online/offline)
- **Instant data synchronization** across all connected clients

### 📊 Analytics & Export
- **Real-time statistics** dashboard
- **CSV export** functionality for patient data
- **Comprehensive reporting** with timestamps

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

## Usage

### Managing Patients
1. **Add a new patient:**
   - Fill out the Patient Intake form
   - The system automatically calculates severity based on vital signs
   - Click "Add Patient" to add to the queue

2. **Manage patient queues:**
   - Patients are automatically sorted by severity and arrival time
   - Use Promote/Demote buttons to adjust priority
   - Remove patients from the system when needed

3. **Assign patients to rooms:**
   - Click "Assign Next Patient" to automatically assign the highest priority patient
   - View room status and complete consultations
   - Rename rooms as needed

### Real-time Collaboration
- Multiple users can work simultaneously
- All changes are synchronized in real-time
- Connection status is shown in the top-right corner
- Data persists across browser sessions

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

## Real-time Events

### Socket.IO Events
- `patient-added` - New patient added
- `patient-updated` - Patient information updated
- `patient-removed` - Patient removed from system
- `room-updated` - Room status changed

## Technology Stack

### Backend
- **Node.js** with Express.js
- **Socket.IO** for real-time communication

### Frontend
- **Vanilla JavaScript** (ES6+)
- **CSS3** with custom properties
- **Socket.IO Client** for real-time updates
- **Local Storage** for data persistence

## Development

### Project Structure
```
├── server.js          # Main server file with Socket.IO
├── app.js            # Frontend JavaScript with real-time features
├── index.html        # Main HTML file
├── styles.css        # CSS styles
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

### Environment Variables (Optional)
Create a `.env` file for configuration:
```
PORT=3000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section below
2. Review the API documentation
3. Create an issue on GitHub

## Troubleshooting

### Common Issues

1. **Real-time updates not working:**
   - Check browser console for WebSocket errors
   - Verify server is running on correct port
   - Check firewall settings
   - Ensure Socket.IO is properly connected

2. **Port already in use:**
   - Change PORT in server.js or .env file
   - Kill existing Node.js processes
   - Use different port number

3. **Data not persisting:**
   - Check browser localStorage is enabled
   - Clear browser cache and try again
   - Verify JavaScript is enabled

### Performance Tips

- Use Chrome DevTools to monitor WebSocket connections
- Check Network tab for connection status
- Monitor browser console for errors
- Use Lighthouse for performance auditing

## Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Role-based access control
- [ ] Advanced reporting and analytics
- [ ] Mobile app development
- [ ] Integration with hospital systems
- [ ] Automated severity assessment using ML
- [ ] Notification system
- [ ] Data backup and recovery
