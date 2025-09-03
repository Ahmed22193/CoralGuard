/**
 * Utility module for DTO validation and transformation
 * Provides common validation functions and error handling for all DTOs
 */

// Common validation utilities
export class DTOValidationUtils {
  
  // Email validation
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Password strength validation
  static isValidPassword(password) {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  // Name validation (no numbers or special characters except spaces, hyphens, apostrophes)
  static isValidName(name) {
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    return nameRegex.test(name) && name.trim().length >= 2;
  }

  // Phone number validation (international format)
  static isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone);
  }

  // Date validation
  static isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  // Age validation (must be between 13 and 120)
  static isValidAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = Math.floor((today - birth) / (365.25 * 24 * 60 * 60 * 1000));
    return age >= 13 && age <= 120;
  }

  // URL validation
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Sanitize string input (remove dangerous characters)
  static sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .trim();
  }

  // Validate MongoDB ObjectId format
  static isValidObjectId(id) {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  }

  // File type validation
  static isValidImageType(mimetype) {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ];
    return allowedTypes.includes(mimetype);
  }

  // File size validation (in bytes)
  static isValidFileSize(size, maxSizeInMB = 10) {
    const maxBytes = maxSizeInMB * 1024 * 1024;
    return size <= maxBytes;
  }
}

// DTO Response Builder
export class DTOResponseBuilder {
  
  // Success response
  static success(data, message = 'Operation successful', statusCode = 200) {
    return {
      status: 'success',
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  // Error response
  static error(message, statusCode = 400, errors = []) {
    return {
      status: 'error',
      statusCode,
      message,
      errors,
      timestamp: new Date().toISOString()
    };
  }

  // Validation error response
  static validationError(errors) {
    return {
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors,
      timestamp: new Date().toISOString()
    };
  }

  // Unauthorized response
  static unauthorized(message = 'Unauthorized access') {
    return {
      status: 'error',
      statusCode: 401,
      message,
      timestamp: new Date().toISOString()
    };
  }

  // Not found response
  static notFound(message = 'Resource not found') {
    return {
      status: 'error',
      statusCode: 404,
      message,
      timestamp: new Date().toISOString()
    };
  }

  // Server error response
  static serverError(message = 'Internal server error') {
    return {
      status: 'error',
      statusCode: 500,
      message,
      timestamp: new Date().toISOString()
    };
  }

  // Paginated response
  static paginated(data, pagination, message = 'Data retrieved successfully') {
    return {
      status: 'success',
      statusCode: 200,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString()
    };
  }
}

// DTO Transformation Helper
export class DTOTransformHelper {
  
  // Remove sensitive fields from object
  static removeSensitiveFields(obj, fieldsToRemove = ['password', 'passwordHash', 'token']) {
    const cleaned = { ...obj };
    fieldsToRemove.forEach(field => {
      delete cleaned[field];
    });
    return cleaned;
  }

  // Convert MongoDB document to plain object
  static toPlainObject(doc) {
    if (doc && typeof doc.toObject === 'function') {
      return doc.toObject();
    }
    return doc;
  }

  // Format date fields
  static formatDates(obj, dateFields = ['createdAt', 'updatedAt']) {
    const formatted = { ...obj };
    dateFields.forEach(field => {
      if (formatted[field]) {
        formatted[field] = new Date(formatted[field]).toISOString();
      }
    });
    return formatted;
  }

  // Convert string IDs to consistent format
  static normalizeId(obj) {
    if (obj._id) {
      obj.id = obj._id.toString();
      delete obj._id;
    }
    if (obj.id && typeof obj.id === 'object') {
      obj.id = obj.id.toString();
    }
    return obj;
  }

  // Deep clean object (remove null, undefined, empty strings)
  static deepClean(obj, removeEmpty = true) {
    const cleaned = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        continue;
      }
      
      if (removeEmpty && value === '') {
        continue;
      }
      
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        const cleanedNested = this.deepClean(value, removeEmpty);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;
      }
    }
    
    return cleaned;
  }
}

// Base DTO class with common functionality
export class BaseDTO {
  
  constructor(data = {}) {
    this.data = data;
  }

  // Get validation result with formatted errors
  getValidationResult(errors = []) {
    return {
      isValid: errors.length === 0,
      errors: errors.map(error => ({
        field: error.field || 'unknown',
        message: error.message || error,
        code: error.code || 'VALIDATION_ERROR'
      }))
    };
  }

  // Create error object
  createError(field, message, code = 'VALIDATION_ERROR') {
    return { field, message, code };
  }

  // Sanitize all string fields
  sanitizeStrings() {
    const sanitized = {};
    for (const [key, value] of Object.entries(this.data)) {
      if (typeof value === 'string') {
        sanitized[key] = DTOValidationUtils.sanitizeString(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}

// Export all utilities
export default {
  DTOValidationUtils,
  DTOResponseBuilder,
  DTOTransformHelper,
  BaseDTO
};
