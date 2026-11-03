import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [content, setContent] = useState('');
  const [html, setHtml] = useState('');
  const [roomId, setRoomId] = useState('');
  const [userId, setUserId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [userCount, setUserCount] = useState(0);
  const [showJoinForm, setShowJoinForm] = useState(true);
  
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Generate a unique user ID on component mount
  useEffect(() => {
    const newUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
    setUserId(newUserId);
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('document-content', ({ content: docContent, html: docHtml }) => {
      setContent(docContent);
      setHtml(docHtml);
    });

    newSocket.on('content-updated', ({ content: newContent, html: newHtml, userId: updatedUserId }) => {
      if (updatedUserId !== userId) {
        setContent(newContent);
        setHtml(newHtml);
      }
    });

    newSocket.on('user-joined', ({ userId: joinedUserId, userCount: count }) => {
      console.log(`User ${joinedUserId} joined`);
      setUserCount(count);
      setUsers(prev => [...prev.filter(u => u !== joinedUserId), joinedUserId]);
    });

    newSocket.on('user-left', ({ userId: leftUserId, userCount: count }) => {
      console.log(`User ${leftUserId} left`);
      setUserCount(count);
      setUsers(prev => prev.filter(u => u !== leftUserId));
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(leftUserId);
        return newSet;
      });
    });

    newSocket.on('user-typing', ({ userId: typingUserId, isTyping }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(typingUserId);
        } else {
          newSet.delete(typingUserId);
        }
        return newSet;
      });
    });

    return () => {
      newSocket.close();
    };
  }, [userId]);

  const handleJoinRoom = () => {
    if (roomId.trim() && socket) {
      socket.emit('join-room', { roomId: roomId.trim(), userId });
      setShowJoinForm(false);
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Emit content change to server
    if (socket && roomId) {
      socket.emit('content-change', {
        roomId,
        content: newContent,
        userId
      });
    }

    // Handle typing indicators
    if (socket && roomId) {
      socket.emit('typing-start', { roomId, userId });
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing-stop', { roomId, userId });
      }, 1000);
    }
  };

  const handleCursorChange = (e) => {
    if (socket && roomId) {
      socket.emit('cursor-update', {
        roomId,
        cursorPosition: e.target.selectionStart,
        userId
      });
    }
  };

  const createNewRoom = () => {
    const newRoomId = `room_${Math.random().toString(36).substr(2, 9)}`;
    setRoomId(newRoomId);
  };

  const leaveRoom = () => {
    if (socket && roomId) {
      socket.emit('leave-room', { roomId, userId });
    }
    setRoomId('');
    setContent('');
    setHtml('');
    setUsers([]);
    setTypingUsers(new Set());
    setUserCount(0);
    setShowJoinForm(true);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    // You could add a toast notification here
  };

  if (showJoinForm) {
    return (
      <div className="join-form">
        <div className="join-form-container">
          <h1>Real-time Markdown Editor</h1>
          <p>Collaborate with others in real-time</p>
          
          <div className="form-group">
            <label htmlFor="roomId">Room ID:</label>
            <input
              id="roomId"
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID or create new one"
              onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
          </div>
          
          <div className="button-group">
            <button onClick={handleJoinRoom} disabled={!roomId.trim() || !isConnected}>
              Join Room
            </button>
            <button onClick={createNewRoom} className="secondary">
              Create New Room
            </button>
          </div>
          
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
            {isConnected ? 'Connected' : 'Connecting...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>Markdown Editor</h1>
          <span className="room-info">Room: {roomId}</span>
        </div>
        <div className="header-right">
          <div className="user-count">
            <span className="user-icon">👥</span>
            {userCount} user{userCount !== 1 ? 's' : ''}
          </div>
          <button onClick={copyRoomId} className="copy-button" title="Copy Room ID">
            📋
          </button>
          <button onClick={leaveRoom} className="leave-button">
            Leave Room
          </button>
        </div>
      </header>

      <div className="typing-indicator">
        {typingUsers.size > 0 && (
          <span>
            {Array.from(typingUsers).slice(0, 3).join(', ')}
            {typingUsers.size > 3 && ` and ${typingUsers.size - 3} more`} typing...
          </span>
        )}
      </div>

      <div className="editor-container">
        <div className="panel editor-panel">
          <div className="panel-header">
            <h3>Markdown</h3>
          </div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onSelect={handleCursorChange}
            onKeyUp={handleCursorChange}
            onMouseUp={handleCursorChange}
            className="markdown-editor"
            placeholder="Start typing your markdown here..."
            spellCheck={false}
          />
        </div>

        <div className="panel preview-panel">
          <div className="panel-header">
            <h3>Preview</h3>
          </div>
          <div 
            className="markdown-preview"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
