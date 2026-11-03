# Real-time Collaborative Markdown Editor

A modern, real-time collaborative Markdown editor built with React and Node.js. Multiple users can edit the same document simultaneously with live preview and real-time synchronization.

## Features

- ✨ **Real-time Collaboration**: Multiple users can edit the same document simultaneously
- 📝 **Live Preview**: See your Markdown rendered as HTML in real-time
- 🏠 **Room-based Sessions**: Join or create rooms for collaborative editing
- 👥 **User Presence**: See who's currently in the room and typing
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Clean, intuitive interface with syntax highlighting
- ⚡ **Fast Performance**: Optimized for smooth real-time editing

## Tech Stack

### Frontend
- **React 18**: Modern React with hooks
- **Socket.io Client**: Real-time communication
- **CSS3**: Modern styling with responsive design

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **Socket.io**: WebSocket communication
- **Marked**: Markdown parsing library
- **CORS**: Cross-origin resource sharing

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. **Clone or download the project**
   ```bash
   cd "D:\My Own Projects\Project 1"
   ```

2. **Install dependencies for all parts**
   ```bash
   npm run install-all
   ```

## Running the Application

### Development Mode (Recommended)

Run both frontend and backend simultaneously:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

### Running Separately

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## Usage

1. **Open the application** in your browser at `http://localhost:3000`

2. **Create or Join a Room**:
   - Click "Create New Room" to generate a new room ID
   - Or enter an existing room ID and click "Join Room"
   - Share the room ID with others to collaborate

3. **Start Editing**:
   - Type Markdown in the left panel
   - See live preview in the right panel
   - Changes are synchronized in real-time with other users

4. **Collaborate**:
   - See how many users are in the room
   - View typing indicators when others are editing
   - Copy room ID to share with collaborators

## Supported Markdown Features

- **Headers** (H1-H6)
- **Text formatting** (bold, italic, strikethrough)
- **Lists** (ordered and unordered)
- **Links** and **Images**
- **Code blocks** and inline code
- **Tables**
- **Blockquotes**
- **Horizontal rules**
- **Line breaks**

## API Endpoints

### Backend API

- `GET /health` - Server health check
- `GET /api/room/:roomId` - Get room information

### Socket.io Events

#### Client → Server
- `join-room` - Join a collaborative room
- `content-change` - Send markdown content updates
- `cursor-update` - Send cursor position updates
- `typing-start` - Start typing indicator
- `typing-stop` - Stop typing indicator

#### Server → Client
- `document-content` - Receive initial document content
- `content-updated` - Receive content updates from other users
- `user-joined` - Notification when a user joins
- `user-left` - Notification when a user leaves
- `user-typing` - Typing indicator updates
- `user-cursor-updated` - Cursor position updates from other users

## Project Structure

```
realtime-markdown-editor/
├── backend/
│   ├── package.json
│   └── server.js          # Express server with Socket.io
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Component styles
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## Configuration

### Environment Variables

You can set these environment variables:

- `PORT` - Backend server port (default: 5000)

### CORS Configuration

The backend is configured to accept connections from `http://localhost:3000`. To change this, modify the CORS configuration in `backend/server.js`.

## Development

### Adding Features

1. **Backend changes**: Modify `backend/server.js`
2. **Frontend changes**: Modify `frontend/src/App.js` and `frontend/src/App.css`
3. **Styling changes**: Update CSS files in the frontend

### Testing

- Open multiple browser tabs/windows to test collaboration
- Use different room IDs to test isolation
- Test on different devices for responsive design

## Troubleshooting

### Common Issues

1. **Connection refused**: Make sure the backend server is running on port 5000
2. **CORS errors**: Check that the frontend is running on port 3000
3. **Socket connection fails**: Verify both servers are running and ports are available

### Port Conflicts

If ports 3000 or 5000 are in use:

1. **Backend**: Set `PORT` environment variable
   ```bash
   PORT=5001 npm run server
   ```

2. **Frontend**: Create `.env` file in frontend directory
   ```
   PORT=3001
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Future Enhancements

- [ ] User authentication and profiles
- [ ] Document history and versioning
- [ ] File upload and export
- [ ] Syntax highlighting for code blocks
- [ ] Custom themes and styling
- [ ] Mobile app version
- [ ] Voice/video chat integration
- [ ] Document templates
- [ ] Collaborative cursors
- [ ] Real-time comments and suggestions
