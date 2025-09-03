# Admin Area Documentation

## Overview

The Admin Area provides comprehensive administrative functionality for the CoralGuard application, including user management, content moderation, system settings, analytics, and security monitoring.

## Features

### 🔐 Authentication & Authorization
- Secure admin login/logout with JWT tokens
- Role-based access control (Super Admin, Admin, Moderator)
- Permission-based feature access
- Session management and activity logging

### 👥 Admin Management
- Create, update, and delete admin accounts
- Role and permission management
- Admin status control (active/inactive)
- Profile management with photo upload support

### 👤 User Management
- View and manage all registered users
- User status control (activate/deactivate)
- User profile viewing and editing
- User deletion with data cleanup
- Advanced user search and filtering

### 📊 Dashboard & Analytics
- Real-time system overview
- User growth analytics
- Image upload trends
- System health monitoring
- Activity summaries

### 🔍 Content Moderation
- Review uploaded images
- Content approval/rejection workflow
- Moderation notes and history
- Bulk moderation actions

### ⚙️ System Settings
- Application configuration management
- Feature toggle controls
- Email and notification settings
- Security configuration
- Storage and performance settings

### 📝 Activity Logging
- Comprehensive admin action logging
- Security event tracking
- Audit trail maintenance
- Log filtering and search

## API Endpoints

### Authentication
```
POST /api/admin/auth/login          - Admin login
POST /api/admin/auth/logout         - Admin logout
```

### Admin Management
```
POST /api/admin/register            - Create new admin (requires user_management permission)
GET  /api/admin/                    - Get all admins (requires user_management permission)
GET  /api/admin/:adminId            - Get admin by ID (requires user_management permission)
PUT  /api/admin/:adminId            - Update admin (requires user_management permission)
DELETE /api/admin/:adminId          - Delete admin (requires user_management permission)
PATCH /api/admin/:adminId/status    - Change admin status (requires user_management permission)
```

### Dashboard
```
GET /api/admin/dashboard/overview   - Get dashboard data
GET /api/admin/dashboard/analytics  - Get analytics data (requires analytics_view permission)
```

### User Management
```
GET /api/admin/users/list           - Get all users (requires user_management permission)
GET /api/admin/users/:userId        - Get user details (requires user_management permission)
PATCH /api/admin/users/:userId/status - Update user status (requires user_management permission)
DELETE /api/admin/users/:userId     - Delete user (requires user_management permission)
```

### Content Moderation
```
GET /api/admin/content/moderation   - Get content for moderation (requires content_moderation permission)
POST /api/admin/content/:contentId/moderate - Moderate content (requires content_moderation permission)
```

### System Settings
```
GET /api/admin/settings             - Get system settings (requires system_settings permission)
PUT /api/admin/settings             - Update system setting (requires system_settings permission)
```

### Activity Logs
```
GET /api/admin/logs/activity        - Get activity logs (requires security_management permission)
```

### Profile Management
```
GET /api/admin/profile              - Get admin profile
PUT /api/admin/profile              - Update admin profile
POST /api/admin/profile/change-password - Change admin password
```

## Data Models

### Admin Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['super_admin', 'admin', 'moderator'],
  permissions: Array of permission strings,
  isActive: Boolean,
  lastLogin: Date,
  profileImage: String,
  phone: String,
  department: String,
  createdBy: ObjectId (references Admin),
  timestamps: true
}
```

### Admin Activity Log Model
```javascript
{
  adminId: ObjectId (references Admin),
  action: String (enum of actions),
  targetType: String,
  targetId: ObjectId,
  description: String,
  ipAddress: String,
  userAgent: String,
  metadata: Mixed,
  severity: ['low', 'medium', 'high', 'critical'],
  timestamps: true
}
```

### System Settings Model
```javascript
{
  settingKey: String (unique),
  settingValue: Mixed,
  description: String,
  category: String,
  isEditable: Boolean,
  dataType: String,
  lastModifiedBy: ObjectId (references Admin),
  timestamps: true
}
```

## Permissions System

### Available Permissions
- `user_management` - Create, read, update, delete users and admins
- `content_moderation` - Review and moderate user-generated content
- `system_settings` - Modify application settings and configuration
- `analytics_view` - Access analytics and reporting features
- `backup_restore` - Perform system backups and restore operations
- `security_management` - View security logs and manage security settings

### Role Hierarchy
1. **Super Admin** - Has all permissions automatically
2. **Admin** - Has configurable permissions
3. **Moderator** - Limited permissions, typically just content moderation

## Security Features

### Authentication Security
- JWT token-based authentication
- Token expiration handling
- Password hashing with bcrypt
- Session invalidation on logout

### Authorization Security
- Role-based access control
- Fine-grained permission system
- Route-level permission checking
- Resource-level access control

### Activity Monitoring
- All admin actions are logged
- IP address and user agent tracking
- Severity classification
- Audit trail maintenance

### Data Protection
- Sensitive data exclusion from responses
- Password never returned in API responses
- Data validation and sanitization
- SQL injection prevention

## Setup Instructions

### 1. Create Super Admin
Run the admin seeder to create the first super admin:
```bash
node src/Utils/adminSeeder.js seed
```

Default credentials:
- Email: `superadmin@coralguard.com`
- Password: `SuperAdmin123!`

**Important:** Change the password immediately after first login.

### 2. Environment Variables
Ensure these environment variables are set:
```
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=your_mongodb_connection_string
```

### 3. Database Indexes
The models include database indexes for optimal performance:
- Admin: email, role, isActive
- ActivityLog: adminId, action, createdAt, severity
- SystemSettings: settingKey, category

## Usage Examples

### Admin Login
```javascript
POST /api/admin/auth/login
{
  "email": "admin@coralguard.com",
  "password": "password123"
}
```

### Create New Admin
```javascript
POST /api/admin/register
Authorization: Bearer <admin_token>
{
  "name": "John Doe",
  "email": "john@coralguard.com",
  "password": "password123",
  "role": "admin",
  "permissions": ["user_management", "content_moderation"],
  "department": "Operations"
}
```

### Update System Setting
```javascript
PUT /api/admin/settings
Authorization: Bearer <admin_token>
{
  "settingKey": "max_upload_size",
  "settingValue": 10485760,
  "description": "Maximum file upload size in bytes",
  "category": "storage",
  "dataType": "number"
}
```

## Error Handling

The admin area uses consistent error handling:

### Error Response Format
```javascript
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid token or credentials)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Best Practices

### Security
1. Always use HTTPS in production
2. Implement rate limiting for auth endpoints
3. Regular password updates for admin accounts
4. Monitor suspicious activity patterns
5. Implement IP whitelisting for admin access

### Performance
1. Use pagination for large data sets
2. Implement caching for frequently accessed data
3. Regular database optimization
4. Monitor system performance metrics

### Maintenance
1. Regular backup of admin activity logs
2. Periodic review of admin permissions
3. Archive old activity logs
4. Monitor disk space usage
5. Regular security audits

## Future Enhancements

### Planned Features
- Two-factor authentication (2FA)
- Advanced analytics dashboard
- Bulk operations for user management
- Automated content moderation
- Real-time notifications
- Advanced reporting system
- API rate limiting per admin
- Session management dashboard

### Integration Opportunities
- Email notification system
- SMS alerts for critical actions
- Slack/Teams integration for notifications
- External authentication providers (LDAP, OAuth)
- Advanced monitoring tools integration
