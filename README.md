# Real-time Chat App with Kafka

A scalable real-time chat application built with Node.js, Vue.js, MongoDB, and Apache Kafka, deployable on Kubernetes.

## Architecture

- **Backend**: Node.js with Express, Socket.io, Kafka, and MongoDB
- **Frontend**: Vue.js 3 with Socket.io client
- **Message Broker**: Apache Kafka for message streaming
- **Database**: MongoDB for user data and message persistence
- **Deployment**: Docker containers orchestrated with Kubernetes

## Features

- Real-time messaging with WebSockets
- Multiple chat rooms
- User presence tracking
- Message persistence
- Scalable architecture with Kafka
- Kubernetes-ready deployment

## Quick Start with Docker Compose

1. **Start all services**:
```bash
docker-compose up -d
```

2. **Access the application**:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000

## Kubernetes Deployment

1. **Create namespace**:
```bash
kubectl apply -f k8s/namespace.yaml
```

2. **Deploy infrastructure**:
```bash
kubectl apply -f k8s/zookeeper.yaml
kubectl apply -f k8s/kafka.yaml
kubectl apply -f k8s/mongodb.yaml
```

3. **Build and tag Docker images**:
```bash
# Backend
docker build -t chat-backend:latest ./backend

# Frontend
docker build -t chat-frontend:latest ./frontend
```

4. **Deploy application**:
```bash
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

5. **Access the application**:
   - Add `127.0.0.1 chat.local` to your `/etc/hosts` file
   - Visit http://chat.local

## Development

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run serve
```

## Environment Variables

### Backend (.env)
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/chatapp
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=chat-app
KAFKA_GROUP_ID=chat-group
```

## API Endpoints

- `GET /api/messages/:room` - Get recent messages for a room
- `GET /api/users/:room` - Get online users in a room

## WebSocket Events

- `join` - Join a chat room
- `message` - Send a message
- `disconnect` - Leave the chat

## Scaling

The application is designed to scale horizontally:
- Multiple backend instances can run behind a load balancer
- Kafka handles message distribution across instances
- MongoDB stores persistent data
- Frontend can be served from a CDN

## Monitoring

For production deployment, consider adding:
- Kafka monitoring (Kafka Manager, Confluent Control Center)
- Application monitoring (Prometheus, Grafana)
- Log aggregation (ELK stack)
- Health checks and readiness probes