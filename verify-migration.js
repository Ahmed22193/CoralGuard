import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './src/config/.env' });

// Simple admin verification
async function verifyMigration() {
  console.log('🔍 Verifying Admin Model Migration');
  console.log('=' .repeat(40));

  try {
    // Connect with same settings as migration
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      bufferCommands: false,
    });
    console.log('✅ Database connected');

    // Simple admin schema for verification
    const AdminSchema = new mongoose.Schema({}, { strict: false });
    const Admin = mongoose.model('Admin', AdminSchema);

    // Get all admins
    const admins = await Admin.find({}).lean();
    console.log(`\n📊 Found ${admins.length} admin records`);

    // Display migration results
    console.log('\n📋 Migration Verification Results:');
    console.log('Email'.padEnd(30) + 'Role'.padEnd(15) + 'Level'.padEnd(8) + 'Access'.padEnd(12) + 'Permissions');
    console.log('-'.repeat(80));

    let successCount = 0;
    for (const admin of admins) {
      const email = (admin.email || 'Unknown').substring(0, 28);
      const role = (admin.role || 'unknown').substring(0, 13);
      const level = admin.adminLevel || 'N/A';
      const access = admin.accessLevel || 'N/A';
      const permCount = admin.permissions ? admin.permissions.length : 0;

      console.log(
        email.padEnd(30) + 
        role.padEnd(15) + 
        level.toString().padEnd(8) + 
        access.padEnd(12) + 
        `${permCount} perms`
      );

      // Check if migration was successful
      if (admin.adminLevel && admin.accessLevel && admin.permissions) {
        successCount++;
      }
    }

    // Display detailed info for one admin
    if (admins.length > 0) {
      const superAdmin = admins.find(a => a.role === 'super_admin') || admins[0];
      console.log('\n🔍 Detailed View - Super Admin:');
      console.log(`   Name: ${superAdmin.name}`);
      console.log(`   Email: ${superAdmin.email}`);
      console.log(`   Role: ${superAdmin.role}`);
      console.log(`   Admin Level: ${superAdmin.adminLevel}`);
      console.log(`   Access Level: ${superAdmin.accessLevel}`);
      console.log(`   Verified: ${superAdmin.isVerified ? 'Yes' : 'No'}`);
      console.log(`   Login Attempts: ${superAdmin.loginAttempts || 0}`);
      console.log(`   Permissions: ${superAdmin.permissions ? superAdmin.permissions.length : 0} permissions`);
      
      if (superAdmin.profile) {
        console.log(`   Department: ${superAdmin.profile.department || 'N/A'}`);
        console.log(`   Phone: ${superAdmin.profile.phone || 'N/A'}`);
        console.log(`   Bio: ${superAdmin.profile.bio || 'N/A'}`);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   Total Admins: ${admins.length}`);
    console.log(`   Successfully Migrated: ${successCount}`);
    console.log(`   Migration Rate: ${admins.length > 0 ? Math.round((successCount / admins.length) * 100) : 0}%`);

    if (successCount === admins.length) {
      console.log('\n🎉 Migration completely successful!');
      console.log('✅ All admin records have been updated to the new enhanced structure');
    } else {
      console.log('\n⚠️  Partial migration - some records may need manual review');
    }

    // Test login credentials
    console.log('\n🔑 Admin Login Credentials:');
    console.log('   superadmin@coralguard.com / SuperAdmin123!');
    console.log('   admin@coralguard.com / Admin123!');
    console.log('   moderator@coralguard.com / Moderator123!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

verifyMigration();
