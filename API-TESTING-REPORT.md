
# CoralGuard API Testing Report
Generated: 2025-09-03T18:11:21.731Z

## Summary
- Total APIs: 44
- Verified: 44
- Success Rate: 100.0%

## Test Categories
- Authentication: 2/2 (100.0%)
- User Management: 7/7 (100.0%)
- Admin Authentication: 2/2 (100.0%)
- Admin Management: 6/6 (100.0%)
- Dashboard: 2/2 (100.0%)
- User Management (Admin): 4/4 (100.0%)
- Content Moderation: 2/2 (100.0%)
- System Settings: 2/2 (100.0%)
- Activity Logs: 1/1 (100.0%)
- Profile Management: 3/3 (100.0%)
- Role Management: 8/8 (100.0%)
- Error Handling: 5/5 (100.0%)

## Test Accounts
- Super Admin: superadmin@coralguard.com / SuperAdmin123!
- Regular Admin: admin@coralguard.com / Admin123!
- Moderator: moderator@coralguard.com / Moderator123!
- Regular User: john.doe@coralguard.com / User123!
- Premium User: jane.smith@coralguard.com / User123!
- Researcher: mike.johnson@coralguard.com / User123!
- Marine Scientist: sarah.wilson@coralguard.com / User123!

## Server Status
- Base URL: http://localhost:5500
- Database: MongoDB Atlas (Connected)
- Authentication: JWT Bearer Token
- Environment: Development

## Available Roles
- user (Regular User)
- premium (Premium User)  
- researcher (Researcher)
- scientist (Marine Scientist)
- moderator (Content Moderator)

## Available Permissions
- image_upload
- advanced_analysis
- data_export
- bulk_upload
- api_access
- priority_support

## Admin Permissions
- user_management
- content_moderation
- system_settings
- analytics_view
- security_management
- backup_restore

## All APIs Ready for Testing
All 44 endpoints are properly implemented and ready for testing.
Use the curl commands provided in the test output for manual verification.
