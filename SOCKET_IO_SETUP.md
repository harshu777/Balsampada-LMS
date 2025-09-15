# Socket.IO Real-time Features Implementation

This document outlines the complete Socket.IO implementation for real-time features in the Tuition LMS system.

## Features Implemented

### 1. Real-time Notifications
- Payment approval/rejection notifications
- New assignment notifications
- Class status updates
- Test/exam notifications
- Attendance marking notifications
- System broadcast messages

### 2. User Presence
- Online/offline status tracking
- User connection management
- Real-time user presence updates

### 3. Live Communication
- Typing indicators for chat features
- Class join/leave events
- Broadcast messaging system

### 4. Connection Management
- JWT-based authentication for WebSocket connections
- Automatic reconnection handling
- Role-based room management
- Persistent notification storage

## Backend Architecture

### WebSocket Gateway (`/backend/src/websockets/websockets.gateway.ts`)
Main Socket.IO gateway that handles:
- Connection authentication using JWT tokens
- User presence management
- Role-based room joining
- Real-time events broadcasting
- Connection/disconnection logging

Key features:
- **Authentication**: Verifies JWT tokens on connection
- **Room Management**: Auto-joins users to role-based and user-specific rooms
- **Presence Tracking**: Maintains connected users list
- **Broadcast Methods**: Provides methods for broadcasting to specific roles, users, or classes

### Notifications Gateway (`/backend/src/notifications/notifications.gateway.ts`)
Specialized gateway for notification handling:
- Real-time notification delivery
- Notification read/unread management
- Recent notifications fetching
- Notification type-specific handling

Key methods:
- `sendPaymentNotification()`: Payment status updates
- `sendAssignmentNotification()`: New assignment alerts
- `sendClassStatusNotification()`: Class updates
- `sendAttendanceNotification()`: Attendance marking
- `sendTestNotification()`: Test/exam notifications
- `sendSystemBroadcast()`: Admin announcements

### Notifications Service (`/backend/src/notifications/notifications.service.ts`)
Database operations for notifications:
- CRUD operations for notifications
- Bulk notification creation
- Read status management
- Notification analytics
- Cleanup utilities

### Module Integration
- **WebSocketsModule**: Main WebSocket functionality
- **NotificationsModule**: Notification-specific features
- **AppModule**: Integration with main application
- **PaymentsModule**: Example integration showing real-time payment notifications

## Frontend Architecture

### Socket Context (`/frontend/src/contexts/SocketContext.tsx`)
Main Socket.IO client management:
- Connection establishment and management
- Authentication token handling
- Automatic reconnection
- Event listener management
- User presence features

Key features:
- **Auto-connection**: Connects when user is authenticated
- **Event Handlers**: Typing, class events, user presence
- **Room Management**: Join/leave class rooms
- **Connection Status**: Real-time connection monitoring

### Notification Context (`/frontend/src/contexts/NotificationContext.tsx`)
Specialized context for notifications:
- Notification socket management
- Real-time notification handling
- Unread count tracking
- Toast notification display
- Notification CRUD operations

Key features:
- **Real-time Updates**: Instant notification delivery
- **Toast Display**: Auto-displaying toast notifications
- **Read Management**: Mark as read functionality
- **Recent Fetching**: Load recent notifications on connect

### UI Components

#### NotificationToast (`/frontend/src/components/notifications/NotificationToast.tsx`)
Individual toast notification component:
- Type-specific styling and icons
- Auto-dismiss functionality
- Progress bar indicator
- Action buttons (mark read, close)
- Rich content display for different notification types

#### NotificationPanel (`/frontend/src/components/notifications/NotificationPanel.tsx`)
Full notification management panel:
- All notifications list
- Filtering and sorting
- Bulk actions
- Connection status indicator
- Real-time updates

### Socket Service (`/frontend/src/services/socket.service.ts`)
Utility service for Socket.IO operations:
- Connection management
- Event emission helpers
- Event listener utilities
- Error handling
- Service methods for common operations

### Providers Setup (`/frontend/src/components/providers/Providers.tsx`)
Context providers wrapper:
- **Provider Order**: Auth → Socket → Notifications
- **Global Access**: Available throughout the app
- **Proper Nesting**: Ensures dependencies are available

## Socket.IO Rooms Structure

### User-Specific Rooms
- `user:{userId}`: Individual user notifications
- `role:{userRole}`: Role-based broadcasts (ADMIN, TEACHER, STUDENT)

### Class-Specific Rooms
- `class:{classId}`: Class-related events and notifications

### Special Rooms
- `admin`: Administrative broadcasts
- Global room (default): System-wide announcements

## Authentication Flow

### WebSocket Authentication
1. Client connects with JWT token in `auth` or `Authorization` header
2. Server verifies token using JwtService
3. User info extracted and stored in socket object
4. User automatically joined to appropriate rooms
5. Connection confirmed and user presence updated

### Automatic Reconnection
- Exponential backoff strategy
- Maximum 5 reconnection attempts
- 1-5 second delay between attempts
- Automatic room re-joining on successful reconnection

## Event Types

### Connection Events
- `connect`: Successful connection
- `disconnect`: Connection lost
- `user:online`: User came online
- `user:offline`: User went offline
- `users:online`: List of online users

### Notification Events
- `notification:new`: New notification received
- `notification:unread-count`: Unread count update
- `notification:recent-list`: Recent notifications list
- `notification:mark-read`: Mark notification as read
- `notification:mark-all-read`: Mark all as read

### Class Events
- `class:join`: Join a class room
- `class:leave`: Leave a class room
- `class:user-joined`: User joined class
- `class:user-left`: User left class

### Communication Events
- `typing:start`: User started typing
- `typing:stop`: User stopped typing
- `broadcast:message`: System broadcast message

## Usage Examples

### Backend - Sending Payment Notification
```typescript
// In PaymentsService
await this.notificationsGateway.sendPaymentNotification(userId, {
  id: payment.id,
  status: 'APPROVED',
  amount: payment.amount,
  type: payment.type,
});
```

### Frontend - Using Notifications
```typescript
// In a React component
const { notifications, unreadCount, markAsRead } = useNotifications();

// Mark notification as read
const handleMarkAsRead = (notificationId: string) => {
  markAsRead(notificationId);
};
```

### Frontend - Using Socket Events
```typescript
// In a React component
const { joinClass, leaveClass, onTypingStart } = useSocket();

// Join a class room
useEffect(() => {
  joinClass('class-123');
  return () => leaveClass('class-123');
}, []);

// Listen for typing events
useEffect(() => {
  onTypingStart((data) => {
    console.log(`${data.userName} is typing in ${data.roomId}`);
  });
}, []);
```

## Environment Variables

### Backend (.env)
```
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

## Deployment Considerations

### Production Settings
1. **CORS Configuration**: Update allowed origins for production domains
2. **Connection Limits**: Configure connection limits based on expected users
3. **Load Balancing**: Consider Redis adapter for multi-server deployments
4. **Monitoring**: Implement connection monitoring and alerting

### Performance Optimizations
1. **Room Management**: Efficient room joining/leaving
2. **Event Throttling**: Rate limiting for high-frequency events
3. **Connection Pooling**: Reuse connections where possible
4. **Memory Management**: Regular cleanup of disconnected users

## Security Features

### Authentication
- JWT token verification on connection
- User role validation
- Room access control

### Rate Limiting
- Connection rate limiting
- Event emission throttling
- Spam protection

### Data Validation
- Input sanitization for all events
- Type checking for event payloads
- Authorization checks for sensitive operations

## Testing

### Backend Testing
- Unit tests for gateway methods
- Integration tests for notification flows
- Connection/disconnection testing
- Room management testing

### Frontend Testing
- Context provider testing
- Socket event handling tests
- UI component testing
- Error handling testing

## Troubleshooting

### Common Issues
1. **Connection Failures**: Check JWT token validity
2. **Missing Notifications**: Verify room membership
3. **Duplicate Connections**: Check for multiple context providers
4. **Performance Issues**: Monitor connection counts and room sizes

### Debugging
- Enable Socket.IO debug logging
- Monitor network connections
- Check browser console for errors
- Verify backend logs for connection issues

## Future Enhancements

### Planned Features
1. **Private Messaging**: Direct user-to-user communication
2. **File Sharing**: Real-time file upload notifications
3. **Video Call Integration**: Live class notifications
4. **Mobile Push Notifications**: Integration with FCM/APNS
5. **Offline Support**: Queue notifications for offline users

### Scalability Improvements
1. **Redis Adapter**: Multi-server Socket.IO scaling
2. **Database Optimization**: Efficient notification querying
3. **Caching**: Redis caching for frequently accessed data
4. **Load Testing**: Performance testing under high load