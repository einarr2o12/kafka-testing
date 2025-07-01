# Chat App API Documentation

## Base URL
```
http://localhost:3000/api
```

## REST API Endpoints

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-06-30T17:25:58.102Z"
}
```

### Get Messages
```http
GET /api/messages/{room}
```

**Parameters:**
- `room` (string): Room name (e.g., "general", "tech", "random")

**Response:**
```json
[
  {
    "_id": "6862c8443a7ecf55ecc48b2c",
    "content": "Hello everyone!",
    "username": "john_doe",
    "room": "general",
    "timestamp": "2025-06-30T17:24:20.098Z",
    "__v": 0
  }
]
```

### Get Online Users
```http
GET /api/users/{room}
```

**Parameters:**
- `room` (string): Room name

**Response:**
```json
[
  {
    "_id": "6862c848b36f087e13266e66",
    "username": "john_doe",
    "isOnline": true,
    "lastSeen": "2025-06-30T17:24:24.845Z",
    "room": "general",
    "socketId": "SjBVVZhiZNt4obBxAAAD"
  }
]
```

## WebSocket Events

### Client to Server Events

#### Join Room
```javascript
socket.emit('join', {
  username: "john_doe",
  room: "general"
})
```

#### Send Message
```javascript
socket.emit('message', {
  content: "Hello everyone!",
  username: "john_doe", 
  room: "general"
})
```

### Server to Client Events

#### Receive Message
```javascript
socket.on('message', (data) => {
  // data structure:
  {
    content: "Hello everyone!",
    username: "john_doe",
    room: "general",
    timestamp: "2025-06-30T17:24:20.098Z",
    type: "message" | "join" | "leave"
  }
})
```

## Error Responses

### 500 Internal Server Error
```json
{
  "error": "Error message description"
}
```

## Rate Limiting
- No rate limiting currently implemented
- Consider adding rate limiting for production use

## Authentication
- No authentication currently implemented
- Users identified by username only
- Consider adding JWT authentication for production