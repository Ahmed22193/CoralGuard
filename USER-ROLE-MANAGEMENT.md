# User Role Management System

## Overview

The enhanced user management system allows administrators to assign and modify user roles with different permissions and subscription levels. This system provides granular control over user capabilities within the CoralGuard platform.

## User Roles

### 1. **Regular User** (`user`)
- **Default role** for new registrations
- **Permissions**: `image_upload`
- **Features**: Basic coral image analysis
- **Limitations**: Limited uploads per month, basic support

### 2. **Premium User** (`premium`)
- **Enhanced features** with priority support
- **Permissions**: `image_upload`, `advanced_analysis`, `priority_support`
- **Features**: Unlimited uploads, advanced analysis, priority support
- **Subscription**: Required (paid plan)

### 3. **Researcher** (`researcher`)
- **Academic research** access
- **Permissions**: `image_upload`, `advanced_analysis`, `data_export`, `api_access`
- **Features**: Data export, API access, research tools, collaboration
- **Subscription**: Not required (free for academics)

### 4. **Marine Scientist** (`scientist`)
- **Full access** for scientific research
- **Permissions**: All permissions (`image_upload`, `advanced_analysis`, `data_export`, `bulk_upload`, `api_access`, `priority_support`)
- **Features**: Full API access, bulk upload, advanced analytics, custom models
- **Subscription**: Not required

### 5. **Content Moderator** (`moderator`)
- **Content moderation** and quality control
- **Permissions**: `image_upload`, `advanced_analysis`, `data_export`
- **Features**: Content moderation, quality control, limited user management
- **Subscription**: Not required

## Available Permissions

### Core Permissions
- `image_upload` - Upload and analyze coral images
- `advanced_analysis` - Access to advanced analysis features
- `data_export` - Export analysis data and results
- `bulk_upload` - Upload multiple images simultaneously
- `api_access` - Access to programmatic API
- `priority_support` - Priority customer support

## Subscription Plans

### Free Plan
- **Cost**: $0/month
- **Features**: 5 uploads per month, basic analysis, community support
- **Suitable for**: Casual users, students

### Basic Plan
- **Cost**: $9.99/month
- **Features**: 50 uploads per month, advanced analysis, email support
- **Suitable for**: Regular users, small organizations

### Premium Plan
- **Cost**: $29.99/month
- **Features**: Unlimited uploads, priority support, API access, data export
- **Suitable for**: Researchers, professional users

### Enterprise Plan
- **Cost**: $99.99/month
- **Features**: Custom limits, dedicated support, custom models, white-label
- **Suitable for**: Large organizations, institutions

## API Endpoints

### Role Management
```bash
# Change user role
POST /api/admin/users/{userId}/change-role
{
  "newRole": "researcher",
  "permissions": ["image_upload", "advanced_analysis", "data_export"],
  "reason": "User is a marine biology student conducting research",
  "notifyUser": true
}

# Bulk role change
POST /api/admin/users/bulk-change-roles
{
  "userIds": ["userId1", "userId2", "userId3"],
  "newRole": "premium",
  "reason": "Upgrading research team members",
  "notifyUsers": true
}

# Get users by role
GET /api/admin/users/by-role/researcher?page=1&limit=10

# Get role statistics
GET /api/admin/users/role-stats

# Get role templates
GET /api/admin/users/role-templates
```

### Role History
```bash
# Get user role history
GET /api/admin/users/{userId}/role-history?page=1&limit=10

# Get all role changes
GET /api/admin/users/role-history?page=1&limit=20&newRole=scientist&startDate=2024-01-01
```

### Subscription Management
```bash
# Update user subscription
PUT /api/admin/users/{userId}/subscription
{
  "plan": "premium",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "isActive": true
}
```

## Role Change Workflow

### 1. **Role Validation**
- Check admin permissions for role transition
- Validate target role exists and is appropriate
- Ensure proper authorization hierarchy

### 2. **Role Assignment**
- Update user role and permissions
- Set role change metadata (changed by, timestamp)
- Apply default permissions for new role

### 3. **History Tracking**
- Record role change in history log
- Store previous and new role information
- Include reason for change and admin details

### 4. **Notification**
- Send email notification to user (optional)
- Log activity in admin activity logs
- Update user's last modification timestamp

## Permission Hierarchy

### Admin Role Permissions
```
Super Admin: Can change any user to any role
Admin: Can manage roles below scientist level
Moderator: Can only manage basic user roles (user, premium)
```

### Role Transition Rules
```
✅ user → premium (with subscription)
✅ user → researcher (for academics)
✅ researcher → scientist (for qualified researchers)
✅ premium → researcher (upgrade path)
❌ moderator → scientist (requires admin approval)
❌ scientist → moderator (requires super admin approval)
```

## Security Features

### Role Change Authorization
- Admin must have `user_management` permission
- Role transitions follow hierarchy rules
- All changes are logged with IP and user agent
- Reason required for all role changes

### Data Protection
- User passwords never exposed in role operations
- Sensitive data excluded from role history
- Activity logging with severity classification
- Audit trail for compliance requirements

## Usage Examples

### Promote User to Researcher
```javascript
// Admin promotes a student to researcher role
const roleChange = {
  userId: "user123",
  newRole: "researcher",
  permissions: ["image_upload", "advanced_analysis", "data_export", "api_access"],
  reason: "User is conducting marine biology research at university",
  notifyUser: true
};

// API call
POST /api/admin/users/user123/change-role
Authorization: Bearer <admin_token>
```

### Bulk Upgrade Team Members
```javascript
// Upgrade entire research team
const bulkChange = {
  userIds: ["user1", "user2", "user3", "user4"],
  newRole: "scientist",
  reason: "Research team requires full access for coral monitoring project",
  notifyUsers: true
};

// API call
POST /api/admin/users/bulk-change-roles
Authorization: Bearer <admin_token>
```

### View Role Statistics
```javascript
// Get comprehensive role statistics
GET /api/admin/users/role-stats
Authorization: Bearer <admin_token>

// Response includes:
{
  "totalUsers": 1250,
  "activeUsers": 1180,
  "usersByRole": {
    "user": 850,
    "premium": 200,
    "researcher": 150,
    "scientist": 45,
    "moderator": 5
  },
  "usersBySubscription": {
    "free": 850,
    "basic": 150,
    "premium": 200,
    "enterprise": 50
  },
  "recentRoleChanges": [...],
  "growthStats": {
    "newUsersThisWeek": 25,
    "newUsersThisMonth": 120,
    "weeklyGrowthRate": "2.0%",
    "monthlyGrowthRate": "10.6%"
  }
}
```

## Best Practices

### Role Assignment
1. **Verify User Identity** - Confirm user credentials before role changes
2. **Document Reasons** - Always provide clear reason for role changes
3. **Follow Hierarchy** - Respect role transition rules and permissions
4. **Notify Users** - Inform users of role changes and new capabilities

### Subscription Management
1. **Align Roles with Plans** - Ensure role permissions match subscription features
2. **Monitor Usage** - Track feature usage against subscription limits
3. **Handle Downgrades** - Gracefully handle subscription cancellations
4. **Billing Integration** - Sync role changes with billing system

### Security Considerations
1. **Regular Audits** - Review role assignments periodically
2. **Activity Monitoring** - Monitor suspicious role change patterns
3. **Access Controls** - Implement proper admin permission checks
4. **Data Retention** - Maintain role history for compliance

## Troubleshooting

### Common Issues

1. **Role Change Denied**
   - Check admin permissions
   - Verify role transition rules
   - Ensure user exists and is active

2. **Permission Not Applied**
   - Wait for token refresh
   - Check permission mappings
   - Verify role assignment success

3. **Notification Failure**
   - Check email service status
   - Verify user email address
   - Review notification settings

### Error Messages

- `"Insufficient permissions to change to this role"` - Admin lacks authority
- `"Invalid role specified"` - Target role doesn't exist
- `"User not found"` - User ID is invalid
- `"Reason for role change must be at least 10 characters"` - Reason too short

## Future Enhancements

### Planned Features
- **Automatic Role Suggestions** based on usage patterns
- **Role-based Feature Flags** for gradual rollouts
- **Advanced Analytics** for role effectiveness
- **Integration with External Identity Providers**
- **Custom Role Creation** for enterprise clients
- **Temporary Role Assignments** with expiration dates

---

This comprehensive role management system ensures proper access control while providing flexibility for different user types and organizational needs within the CoralGuard platform.
