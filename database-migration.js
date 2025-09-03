import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './src/DB/ConnectionDB.js';
import Admin from './src/DB/Models/Admin/admin.model.js';
import User from './src/DB/Models/users.model.js';

class DatabaseMigration {
  constructor() {
    this.migrationVersion = '1.0.0';
    this.migrationName = 'Enhanced Admin Model Migration';
  }

  async runMigration() {
    console.log('🚀 Starting Database Migration');
    console.log(`📝 Migration: ${this.migrationName}`);
    console.log(`📅 Version: ${this.migrationVersion}`);
    console.log('=' .repeat(60));

    try {
      // Connect to database
      await connectDB();
      console.log('✅ Connected to database successfully');

      // Run migration steps
      await this.migrateAdminModel();
      await this.createDefaultAdmins();
      await this.verifyMigration();

      console.log('\n🎉 Migration completed successfully!');
      console.log('✅ All admin records have been updated to the new structure');

    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async migrateAdminModel() {
    console.log('\n📋 Step 1: Migrating Existing Admin Records');
    console.log('-' .repeat(40));

    try {
      // Get all existing admin records
      const existingAdmins = await Admin.find({});
      console.log(`📊 Found ${existingAdmins.length} existing admin records`);

      if (existingAdmins.length === 0) {
        console.log('ℹ️  No existing admin records found, proceeding with fresh setup');
        return;
      }

      // Update each admin record to new structure
      for (const admin of existingAdmins) {
        try {
          const updateData = {
            // Add new required fields if missing
            adminLevel: this.getAdminLevelByRole(admin.role),
            accessLevel: this.getAccessLevelByRole(admin.role),
            isVerified: true,
            loginAttempts: 0,
            
            // Migrate profile structure
            profile: {
              ...admin.profile,
              department: admin.profile?.department || admin.department || 'System Administration',
              phone: admin.profile?.phone || admin.phone || '',
              bio: admin.profile?.bio || `${admin.role.replace('_', ' ').toUpperCase()} administrator`,
              profileImage: admin.profile?.profileImage || admin.profileImage || '',
            },

            // Update permissions to new structure
            permissions: this.migratePermissions(admin.permissions, admin.role),
          };

          // Remove old fields that are now in profile
          const fieldsToUnset = {};
          if (admin.department !== undefined) fieldsToUnset.department = 1;
          if (admin.phone !== undefined) fieldsToUnset.phone = 1;
          if (admin.profileImage !== undefined) fieldsToUnset.profileImage = 1;

          const updateQuery = { $set: updateData };
          if (Object.keys(fieldsToUnset).length > 0) {
            updateQuery.$unset = fieldsToUnset;
          }

          await Admin.findByIdAndUpdate(admin._id, updateQuery);
          console.log(`✅ Migrated admin: ${admin.email} (${admin.role})`);

        } catch (adminError) {
          console.error(`❌ Failed to migrate admin ${admin.email}:`, adminError.message);
        }
      }

      console.log('✅ Admin model migration completed');

    } catch (error) {
      console.error('❌ Admin migration failed:', error);
      throw error;
    }
  }

  async createDefaultAdmins() {
    console.log('\n📋 Step 2: Creating Default Admin Accounts');
    console.log('-' .repeat(40));

    const defaultAdmins = [
      {
        name: 'Super Administrator',
        email: 'superadmin@coralguard.com',
        password: 'SuperAdmin123!',
        role: 'super_admin',
        adminLevel: 10,
        accessLevel: 'full_access',
        permissions: [
          'user_management', 'content_moderation', 'system_settings', 
          'analytics_view', 'security_management', 'backup_restore',
          'admin_management', 'role_assignment', 'system_monitoring', 
          'database_access', 'api_access', 'priority_support'
        ],
        profile: {
          department: 'System Administration',
          phone: '+1-555-0001',
          bio: 'System Super Administrator with full access',
          emergencyContact: '+1-555-9001'
        }
      },
      {
        name: 'System Administrator',
        email: 'admin@coralguard.com',
        password: 'Admin123!',
        role: 'admin',
        adminLevel: 5,
        accessLevel: 'write',
        permissions: ['user_management', 'analytics_view', 'system_settings', 'advanced_analysis', 'data_export'],
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
        password: 'ContentAdmin123!',
        role: 'content_admin',
        adminLevel: 3,
        accessLevel: 'write',
        permissions: ['content_moderation', 'user_management', 'analytics_view', 'image_upload', 'bulk_upload'],
        profile: {
          department: 'Content Management',
          phone: '+1-555-0005',
          bio: 'Content administration specialist',
          emergencyContact: '+1-555-9005'
        }
      },
      {
        name: 'Content Moderator',
        email: 'moderator@coralguard.com',
        password: 'Moderator123!',
        role: 'moderator',
        adminLevel: 1,
        accessLevel: 'write',
        permissions: ['content_moderation', 'analytics_view', 'image_upload', 'advanced_analysis'],
        profile: {
          department: 'Content Management',
          phone: '+1-555-0002',
          bio: 'Content moderation specialist',
          emergencyContact: '+1-555-9002'
        }
      }
    ];

    for (const adminData of defaultAdmins) {
      try {
        const existingAdmin = await Admin.findOne({ email: adminData.email });
        
        if (!existingAdmin) {
          // Hash password
          const hashedPassword = await bcrypt.hash(adminData.password, 10);
          
          // Create new admin
          const newAdmin = new Admin({
            ...adminData,
            password: hashedPassword,
            isActive: true,
            isVerified: true,
            loginAttempts: 0
          });

          await newAdmin.save();
          console.log(`✅ Created new admin: ${adminData.email} (${adminData.role})`);
        } else {
          console.log(`ℹ️  Admin already exists: ${adminData.email}`);
        }
      } catch (error) {
        console.error(`❌ Failed to create admin ${adminData.email}:`, error.message);
      }
    }

    console.log('✅ Default admin creation completed');
  }

  async verifyMigration() {
    console.log('\n📋 Step 3: Verifying Migration Results');
    console.log('-' .repeat(40));

    try {
      // Get all admins and verify structure
      const allAdmins = await Admin.find({}).sort({ adminLevel: -1 });
      console.log(`📊 Total admin accounts: ${allAdmins.length}`);

      console.log('\n👤 Admin Account Summary:');
      console.log('Email'.padEnd(30) + 'Role'.padEnd(15) + 'Level'.padEnd(8) + 'Access'.padEnd(12) + 'Status');
      console.log('-'.repeat(75));

      for (const admin of allAdmins) {
        const status = admin.isActive ? '✅ Active' : '❌ Inactive';
        const email = admin.email.length > 28 ? admin.email.substring(0, 25) + '...' : admin.email;
        
        console.log(
          email.padEnd(30) + 
          admin.role.padEnd(15) + 
          admin.adminLevel.toString().padEnd(8) + 
          admin.accessLevel.padEnd(12) + 
          status
        );

        // Verify required fields
        const missingFields = [];
        if (!admin.adminLevel) missingFields.push('adminLevel');
        if (!admin.accessLevel) missingFields.push('accessLevel');
        if (!admin.permissions || admin.permissions.length === 0) missingFields.push('permissions');
        if (!admin.profile) missingFields.push('profile');

        if (missingFields.length > 0) {
          console.log(`   ⚠️  Missing fields: ${missingFields.join(', ')}`);
        }
      }

      // Test admin methods
      console.log('\n🧪 Testing Admin Model Methods:');
      const superAdmin = allAdmins.find(a => a.role === 'super_admin');
      const moderator = allAdmins.find(a => a.role === 'moderator');

      if (superAdmin && moderator) {
        const canManage = superAdmin.canManage(moderator);
        const hasPermission = superAdmin.hasPermission('user_management');
        const isLocked = superAdmin.isLocked;

        console.log(`   Super Admin can manage Moderator: ${canManage ? '✅' : '❌'}`);
        console.log(`   Super Admin has user_management permission: ${hasPermission ? '✅' : '❌'}`);
        console.log(`   Super Admin account locked: ${isLocked ? '🔒' : '🔓'}`);
      }

      console.log('✅ Migration verification completed');

    } catch (error) {
      console.error('❌ Migration verification failed:', error);
      throw error;
    }
  }

  getAdminLevelByRole(role) {
    const roleLevels = {
      'super_admin': 10,
      'system_admin': 8,
      'admin': 5,
      'content_admin': 3,
      'moderator': 1
    };
    return roleLevels[role] || 1;
  }

  getAccessLevelByRole(role) {
    const roleAccess = {
      'super_admin': 'full_access',
      'system_admin': 'full_access',
      'admin': 'write',
      'content_admin': 'write',
      'moderator': 'write'
    };
    return roleAccess[role] || 'read';
  }

  migratePermissions(existingPermissions, role) {
    // Default permissions based on role
    const defaultPermissions = this.getDefaultPermissionsByRole(role);
    
    // Merge existing permissions with defaults
    const allPermissions = [...new Set([...defaultPermissions, ...(existingPermissions || [])])];
    
    return allPermissions;
  }

  getDefaultPermissionsByRole(role) {
    const rolePermissions = {
      'super_admin': [
        'user_management', 'content_moderation', 'system_settings', 
        'analytics_view', 'backup_restore', 'security_management',
        'admin_management', 'role_assignment', 'system_monitoring', 
        'database_access', 'api_access', 'priority_support'
      ],
      'system_admin': [
        'user_management', 'system_settings', 'analytics_view', 
        'backup_restore', 'security_management', 'system_monitoring',
        'api_access'
      ],
      'admin': [
        'user_management', 'content_moderation', 'analytics_view',
        'advanced_analysis', 'data_export'
      ],
      'content_admin': [
        'content_moderation', 'user_management', 'analytics_view',
        'image_upload', 'bulk_upload'
      ],
      'moderator': [
        'content_moderation', 'image_upload', 'advanced_analysis'
      ]
    };
    return rolePermissions[role] || ['content_moderation'];
  }

  async rollbackMigration() {
    console.log('🔄 Rolling back migration...');
    console.log('⚠️  Note: This will remove enhanced fields but keep admin accounts');
    
    try {
      const admins = await Admin.find({});
      
      for (const admin of admins) {
        const rollbackData = {
          $unset: {
            adminLevel: 1,
            accessLevel: 1,
            loginAttempts: 1,
            lockUntil: 1,
            managedBy: 1
          }
        };

        await Admin.findByIdAndUpdate(admin._id, rollbackData);
        console.log(`✅ Rolled back admin: ${admin.email}`);
      }

      console.log('✅ Migration rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'migrate';

  const migration = new DatabaseMigration();

  try {
    switch (command.toLowerCase()) {
      case 'migrate':
      case 'up':
        await migration.runMigration();
        break;
      
      case 'rollback':
      case 'down':
        await migration.rollbackMigration();
        break;
      
      case 'verify':
        await connectDB();
        await migration.verifyMigration();
        break;
      
      default:
        console.log('🔧 CoralGuard Database Migration Tool');
        console.log('=' .repeat(40));
        console.log('Usage: node database-migration.js <command>');
        console.log('');
        console.log('Commands:');
        console.log('  migrate, up     Run the migration (default)');
        console.log('  rollback, down  Rollback the migration');
        console.log('  verify          Verify migration results');
        console.log('');
        console.log('Examples:');
        console.log('  node database-migration.js migrate');
        console.log('  node database-migration.js verify');
        console.log('  node database-migration.js rollback');
        break;
    }
  } catch (error) {
    console.error('💥 Migration process failed:', error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default DatabaseMigration;
