import Admin from "../DB/Models/Admin/admin.model.js";
import { hashPassword } from "../Utils/hash.utils.js";
import connectDB from "../DB/ConnectionDB.js";

export const createSuperAdmin = async () => {
  try {
    await connectDB();
    
    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('Super admin already exists');
      return;
    }

    // Create super admin
    const superAdminData = {
      name: 'Super Admin',
      email: 'superadmin@coralguard.com',
      password: await hashPassword('SuperAdmin123!'),
      role: 'super_admin',
      permissions: [
        'user_management',
        'content_moderation',
        'system_settings',
        'analytics_view',
        'backup_restore',
        'security_management'
      ],
      isActive: true,
      department: 'System Administration'
    };

    const superAdmin = new Admin(superAdminData);
    await superAdmin.save();

    console.log('Super admin created successfully');
    console.log('Email: superadmin@coralguard.com');
    console.log('Password: SuperAdmin123!');
    console.log('Please change the password after first login');
    
  } catch (error) {
    console.error('Error creating super admin:', error.message);
  }
};

// Script to run seeder
if (process.argv[2] === 'seed') {
  createSuperAdmin()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
