import jwt from "jsonwebtoken";
import Admin from "../DB/Models/Admin/admin.model.js";
import { globalError } from "../Utils/gloabelError.js";

export const VerifyingAdminToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(globalError("Access token is required", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is for admin
    if (decoded.type !== 'admin') {
      return next(globalError("Invalid token type", 401));
    }

    // Find admin in database
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      return next(globalError("Admin not found", 401));
    }

    if (!admin.isActive) {
      return next(globalError("Admin account is deactivated", 401));
    }

    // Add admin info to request
    req.admin = {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(globalError("Invalid token", 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(globalError("Token expired", 401));
    }
    return next(globalError("Token verification failed", 401));
  }
};
