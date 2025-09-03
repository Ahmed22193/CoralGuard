import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './src/DB/ConnectionDB.js';
import User from './src/DB/Models/users.model.js';
import Admin from './src/DB/Models/Admin/admin.model.js';
import AdminActivityLog from './src/DB/Models/Admin/adminActivityLog.model.js';
import SystemSettings from './src/DB/Models/Admin/systemSettings.model.js';
import UserRoleHistory from './src/DB/Models/Admin/userRoleHistory.model.js';

class DataSeeder {
  constructor() {
    this.saltRounds = 10;
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async seedUsers() {
    console.log('🌱 Seeding Users...');
    
    const users = [
      {
        name: 'John Doe',
        email: 'john.doe@coralguard.com',
        password: await this.hashPassword('User123!'),
        role: 'user',
        permissions: ['image_upload'],
        isActive: true,
        subscription: {
          plan: 'free',
          startDate: new Date(),
          isActive: true
        },
        profile: {
          bio: 'Marine biology enthusiast interested in coral conservation',
          location: 'Miami, FL',
          website: 'https://johndoe.com'
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@coralguard.com',
        password: await this.hashPassword('User123!'),
        role: 'premium',
        permissions: ['image_upload', 'advanced_analysis'],
        isActive: true,
        subscription: {
          plan: 'premium',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          isActive: true
        },
        profile: {
          bio: 'Professional marine researcher',
          location: 'San Diego, CA',
          organization: 'Ocean Research Institute'
        }
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@coralguard.com',
        password: await this.hashPassword('User123!'),
        role: 'researcher',
        permissions: ['image_upload', 'advanced_analysis', 'data_export'],
        isActive: true,
        subscription: {
          plan: 'enterprise',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isActive: true
        },
        profile: {
          bio: 'Coral reef specialist and conservation researcher',
          location: 'Key Largo, FL',
          organization: 'Coral Restoration Foundation'
        }
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@coralguard.com',
        password: await this.hashPassword('User123!'),
        role: 'scientist',
        permissions: ['image_upload', 'advanced_analysis', 'bulk_upload'],
        isActive: true,
        subscription: {
          plan: 'basic',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isActive: true
        },
        profile: {
          bio: 'Marine biology scientist using CoralGuard for research',
          location: 'Tampa, FL',
          organization: 'Tampa Bay Marine Institute'
        }
      },
      {
        name: 'David Brown',
        email: 'david.brown@coralguard.com',
        password: await this.hashPassword('User123!'),
        role: 'user',
        permissions: ['image_upload'],
        isActive: false, // Inactive user for testing
        subscription: {
          plan: 'free',
          startDate: new Date(),
          isActive: false
        },
        profile: {
          bio: 'Diving enthusiast',
          location: 'Hawaii'
        }
      }
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Created user: ${userData.email}`);
      } else {
        console.log(`⚠️  User already exists: ${userData.email}`);
      }
    }
  }

  async seedAdmins() {
    console.log('🌱 Seeding Admins...');
    
    const admins = [
      {
        name: 'Super Administrator',
        email: 'superadmin@coralguard.com',
        password: await this.hashPassword('SuperAdmin123!'),
        role: 'super_admin',
        adminLevel: 10,
        accessLevel: 'full_access',
        permissions: [
          'user_management', 'content_moderation', 'system_settings', 
          'analytics_view', 'security_management', 'backup_restore',
          'admin_management', 'role_assignment', 'system_monitoring', 
          'database_access', 'api_access', 'priority_support'
        ],
        isActive: true,
        isVerified: true,
        profile: {
          department: 'System Administration',
          phone: '+1-555-0001',
          bio: 'System Super Administrator with full access',
          emergencyContact: '+1-555-9001'
        }
      },
      {
        name: 'Content Moderator',
        email: 'moderator@coralguard.com',
        password: await this.hashPassword('Moderator123!'),
        role: 'moderator',
        adminLevel: 1,
        accessLevel: 'write',
        permissions: ['content_moderation', 'analytics_view', 'image_upload', 'advanced_analysis'],
        isActive: true,
        isVerified: true,
        profile: {
          department: 'Content Management',
          phone: '+1-555-0002',
          bio: 'Content moderation specialist',
          emergencyContact: '+1-555-9002'
        }
      },
      {
        name: 'System Admin',
        email: 'admin@coralguard.com',
        password: await this.hashPassword('Admin123!'),
        role: 'admin',
        adminLevel: 5,
        accessLevel: 'write',
        permissions: ['user_management', 'analytics_view', 'system_settings', 'advanced_analysis', 'data_export'],
        isActive: true,
        isVerified: true,
        profile: {
          department: 'System Administration',
          phone: '+1-555-0003',
          bio: 'General system administrator',
          emergencyContact: '+1-555-9003'
        }
      },
      {
        name: 'Content Administrator',
        email: 'contentadmin@coralguard.com',
        password: await this.hashPassword('ContentAdmin123!'),
        role: 'content_admin',
        adminLevel: 3,
        accessLevel: 'write',
        permissions: ['content_moderation', 'user_management', 'analytics_view', 'image_upload', 'bulk_upload'],
        isActive: true,
        isVerified: true,
        profile: {
          department: 'Content Management',
          phone: '+1-555-0005',
          bio: 'Content administration specialist',
          emergencyContact: '+1-555-9005'
        }
      },
      {
        name: 'Test Admin',
        email: 'testadmin@coralguard.com',
        password: await this.hashPassword('TestAdmin123!'),
        role: 'admin',
        adminLevel: 2,
        accessLevel: 'read',
        permissions: ['user_management', 'content_moderation'],
        isActive: false, // Inactive admin for testing
        isVerified: true,
        profile: {
          department: 'Testing',
          phone: '+1-555-0004',
          bio: 'Test administrator account',
          emergencyContact: '+1-555-9004'
        }
      }
    ];

    for (const adminData of admins) {
      const existingAdmin = await Admin.findOne({ email: adminData.email });
      if (!existingAdmin) {
        const admin = await Admin.create(adminData);
        console.log(`✅ Created admin: ${adminData.email} (Level: ${adminData.adminLevel}, Role: ${adminData.role})`);
      } else {
        console.log(`⚠️  Admin already exists: ${adminData.email}`);
      }
    }
  }

  async seedSystemSettings() {
    console.log('🌱 Seeding System Settings...');
    
    const settings = [
      {
        settingKey: 'max_upload_size',
        settingValue: '50', // MB
        dataType: 'number',
        description: 'Maximum file upload size in MB'
      },
      {
        settingKey: 'allowed_file_types',
        settingValue: JSON.stringify(['jpg', 'jpeg', 'png', 'tiff']),
        dataType: 'array',
        description: 'Allowed image file types for upload'
      },
      {
        settingKey: 'analysis_timeout',
        settingValue: '300', // seconds
        dataType: 'number',
        description: 'Maximum time for image analysis in seconds'
      },
      {
        settingKey: 'maintenance_mode',
        settingValue: 'false',
        dataType: 'boolean',
        description: 'Enable/disable maintenance mode'
      },
      {
        settingKey: 'registration_enabled',
        settingValue: 'true',
        dataType: 'boolean',
        description: 'Allow new user registrations'
      },
      {
        settingKey: 'email_notifications',
        settingValue: 'true',
        dataType: 'boolean',
        description: 'Enable email notifications'
      },
      {
        settingKey: 'default_user_role',
        settingValue: 'free_user',
        dataType: 'string',
        description: 'Default role for new users'
      },
      {
        settingKey: 'session_timeout',
        settingValue: '1440', // minutes (24 hours)
        dataType: 'number',
        description: 'User session timeout in minutes'
      }
    ];

    for (const setting of settings) {
      const existingSetting = await SystemSettings.findOne({ settingKey: setting.settingKey });
      if (!existingSetting) {
        await SystemSettings.create(setting);
        console.log(`✅ Created setting: ${setting.settingKey}`);
      } else {
        console.log(`⚠️  Setting already exists: ${setting.settingKey}`);
      }
    }
  }

  async seedActivityLogs() {
    console.log('🌱 Seeding Activity Logs...');
    
    const superAdmin = await Admin.findOne({ role: 'super_admin' });
    const moderator = await Admin.findOne({ role: 'moderator' });
    const testUser = await User.findOne({ email: 'john.doe@coralguard.com' });

    if (!superAdmin || !moderator || !testUser) {
      console.log('⚠️  Required users/admins not found for activity logs');
      return;
    }

    const logs = [
      {
        adminId: superAdmin._id,
        action: 'login',
        targetType: 'Admin',
        targetId: superAdmin._id,
        description: 'Super admin logged into the system',
        ipAddress: '192.168.1.100',
        userAgent: 'Test Browser Mozilla/5.0',
        metadata: { loginMethod: 'email' },
        severity: 'low',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        adminId: superAdmin._id,
        action: 'create_user',
        targetType: 'User',
        targetId: testUser._id,
        description: `Created new user account for ${testUser.email}`,
        ipAddress: '192.168.1.100',
        userAgent: 'Test Browser Mozilla/5.0',
        metadata: { userEmail: testUser.email, userRole: testUser.role },
        severity: 'medium',
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000)
      },
      {
        adminId: moderator._id,
        action: 'login',
        targetType: 'Admin',
        targetId: moderator._id,
        description: 'Content moderator logged into the system',
        ipAddress: '192.168.1.101',
        userAgent: 'Test Browser Mozilla/5.0',
        metadata: { loginMethod: 'email' },
        severity: 'low',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      },
      {
        adminId: moderator._id,
        action: 'moderate_content',
        targetType: 'Content',
        targetId: new mongoose.Types.ObjectId(),
        description: 'Approved image content after review',
        ipAddress: '192.168.1.101',
        userAgent: 'Test Browser Mozilla/5.0',
        metadata: { action: 'approved', contentType: 'image', reason: 'Appropriate content' },
        severity: 'low',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      },
      {
        adminId: superAdmin._id,
        action: 'system_update',
        targetType: 'System',
        targetId: new mongoose.Types.ObjectId(),
        description: 'Updated system setting: max_upload_size from 25MB to 50MB',
        ipAddress: '192.168.1.100',
        userAgent: 'Test Browser Mozilla/5.0',
        metadata: { settingKey: 'max_upload_size', oldValue: '25', newValue: '50' },
        severity: 'medium',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      }
    ];

    for (const log of logs) {
      await AdminActivityLog.create(log);
      console.log(`✅ Created activity log: ${log.action} by ${log.adminId}`);
    }
  }

  async seedUserRoleHistory() {
    console.log('🌱 Seeding User Role History...');
    
    const superAdmin = await Admin.findOne({ role: 'super_admin' });
    const users = await User.find().limit(3);

    if (!superAdmin || users.length === 0) {
      console.log('⚠️  Required users/admins not found for role history');
      return;
    }

    const roleChanges = [
      {
        userId: users[0]._id,
        changedBy: superAdmin._id,
        previousRole: 'user',
        newRole: 'premium',
        previousPermissions: ['image_upload'],
        newPermissions: ['image_upload', 'advanced_analysis'],
        reason: 'Subscription upgrade',
        changeDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      },
      {
        userId: users[1]._id,
        changedBy: superAdmin._id,
        previousRole: 'premium',
        newRole: 'researcher',
        previousPermissions: ['image_upload', 'advanced_analysis'],
        newPermissions: ['image_upload', 'advanced_analysis', 'data_export'],
        reason: 'Research collaboration agreement',
        changeDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        userId: users[2]._id,
        changedBy: superAdmin._id,
        previousRole: 'user',
        newRole: 'scientist',
        previousPermissions: ['image_upload'],
        newPermissions: ['image_upload', 'advanced_analysis', 'bulk_upload'],
        reason: 'Academic institution verification',
        changeDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ];

    for (const change of roleChanges) {
      await UserRoleHistory.create(change);
      console.log(`✅ Created role history: ${change.previousRole} → ${change.newRole}`);
    }
  }

  async clearDatabase() {
    console.log('🧹 Clearing existing data...');
    
    await User.deleteMany({ email: { $ne: 'superadmin@coralguard.com' } }); // Keep super admin
    await Admin.deleteMany({ email: { $ne: 'superadmin@coralguard.com' } });
    await AdminActivityLog.deleteMany({});
    await SystemSettings.deleteMany({});
    await UserRoleHistory.deleteMany({});
    
    console.log('✅ Database cleared (except super admin)');
  }

  async seedAll(clearFirst = false) {
    try {
      console.log('🚀 Starting Data Seeding Process...');
      console.log('=====================================');
      
      await connectDB();
      
      if (clearFirst) {
        await this.clearDatabase();
      }
      
      await this.seedAdmins();
      await this.seedUsers();
      await this.seedSystemSettings();
      await this.seedActivityLogs();
      await this.seedUserRoleHistory();
      
      console.log('=====================================');
      console.log('✅ Data seeding completed successfully!');
      console.log('');
      console.log('📊 Seeded Data Summary:');
      console.log(`👤 Users: ${await User.countDocuments()}`);
      console.log(`🛡️  Admins: ${await Admin.countDocuments()}`);
      console.log(`⚙️  Settings: ${await SystemSettings.countDocuments()}`);
      console.log(`📝 Activity Logs: ${await AdminActivityLog.countDocuments()}`);
      console.log(`📜 Role History: ${await UserRoleHistory.countDocuments()}`);
      console.log('');
      console.log('🔐 Test Accounts Created:');
      console.log('Super Admin: superadmin@coralguard.com / SuperAdmin123!');
      console.log('Admin: admin@coralguard.com / Admin123!');
      console.log('Moderator: moderator@coralguard.com / Moderator123!');
      console.log('User: john.doe@coralguard.com / User123!');
      console.log('Premium User: jane.smith@coralguard.com / User123!');
      console.log('Researcher: mike.johnson@coralguard.com / User123!');
      console.log('Educator: sarah.wilson@coralguard.com / User123!');
      
    } catch (error) {
      console.error('❌ Error during data seeding:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      await connectDB();
      
      const stats = {
        users: await User.countDocuments(),
        activeUsers: await User.countDocuments({ isActive: true }),
        admins: await Admin.countDocuments(),
        activeAdmins: await Admin.countDocuments({ isActive: true }),
        settings: await SystemSettings.countDocuments(),
        activityLogs: await AdminActivityLog.countDocuments(),
        roleHistory: await UserRoleHistory.countDocuments()
      };
      
      console.log('📊 Database Statistics:');
      console.log('=====================');
      console.log(`Total Users: ${stats.users} (Active: ${stats.activeUsers})`);
      console.log(`Total Admins: ${stats.admins} (Active: ${stats.activeAdmins})`);
      console.log(`System Settings: ${stats.settings}`);
      console.log(`Activity Logs: ${stats.activityLogs}`);
      console.log(`Role History Records: ${stats.roleHistory}`);
      
      return stats;
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      throw error;
    }
  }
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];
const seeder = new DataSeeder();

switch (command) {
  case 'seed':
    const clearFirst = args.includes('--clear');
    seeder.seedAll(clearFirst)
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Seeding failed:', error);
        process.exit(1);
      });
    break;
    
  case 'clear':
    seeder.clearDatabase()
      .then(() => {
        console.log('✅ Database cleared successfully');
        process.exit(0);
      })
      .catch(error => {
        console.error('Clear failed:', error);
        process.exit(1);
      });
    break;
    
  case 'stats':
    seeder.getStats()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Stats failed:', error);
        process.exit(1);
      });
    break;
    
  default:
    console.log('🌱 CoralGuard Data Seeder');
    console.log('Usage: node DataSeeder.js <command>');
    console.log('');
    console.log('Commands:');
    console.log('  seed [--clear]  Seed the database with test data (optionally clear first)');
    console.log('  clear          Clear all seeded data');
    console.log('  stats          Show database statistics');
    console.log('');
    console.log('Examples:');
    console.log('  node DataSeeder.js seed          # Seed data');
    console.log('  node DataSeeder.js seed --clear  # Clear then seed');
    console.log('  node DataSeeder.js stats         # Show stats');
    process.exit(0);
}

export default DataSeeder;
