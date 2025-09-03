/**
 * User DTO Mappers
 * Handle transformations between API requests/responses and database models
 */

import { 
  UserRegisterRequestDTO, 
  UserLoginRequestDTO, 
  UserResponseDTO,
  UserLoginResponseDTO,
  UserUpdateRequestDTO 
} from './UserDTO.js';

export class UserDTOMapper {
  
  /**
   * Map registration request to database model
   * @param {Object} requestBody - Raw request body
   * @returns {Object} Database model object
   */
  static mapRegisterRequestToModel(requestBody) {
    const registerDTO = new UserRegisterRequestDTO(requestBody);
    const validation = registerDTO.validate();
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }
    
    return registerDTO.toModel();
  }

  /**
   * Map login request to credentials object
   * @param {Object} requestBody - Raw request body
   * @returns {Object} Login credentials
   */
  static mapLoginRequestToCredentials(requestBody) {
    const loginDTO = new UserLoginRequestDTO(requestBody);
    const validation = loginDTO.validate();
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }
    
    return {
      username: loginDTO.username,
      password: loginDTO.password
    };
  }

  /**
   * Map database user model to API response
   * @param {Object} userModel - Database user model
   * @returns {Object} API response object
   */
  static mapModelToResponse(userModel) {
    const userResponseDTO = new UserResponseDTO(userModel);
    return userResponseDTO;
  }

  /**
   * Map database user model to login response with token
   * @param {Object} userModel - Database user model
   * @param {string} token - JWT token
   * @returns {Object} Login response object
   */
  static mapModelToLoginResponse(userModel, token) {
    const loginResponseDTO = new UserLoginResponseDTO(userModel, token);
    return loginResponseDTO;
  }

  /**
   * Map update request to partial model
   * @param {Object} requestBody - Raw request body
   * @returns {Object} Partial update model
   */
  static mapUpdateRequestToModel(requestBody) {
    const updateDTO = new UserUpdateRequestDTO(requestBody);
    const validation = updateDTO.validate();
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }
    
    return updateDTO.toModel();
  }

  /**
   * Map array of user models to response array
   * @param {Array} userModels - Array of database user models
   * @returns {Array} Array of API response objects
   */
  static mapModelsToResponseArray(userModels) {
    return userModels.map(user => new UserResponseDTO(user));
  }

  /**
   * Map user model with additional metadata to enriched response
   * @param {Object} userModel - Database user model
   * @param {Object} metadata - Additional metadata (lastLogin, loginCount, etc.)
   * @returns {Object} Enriched user response
   */
  static mapModelToEnrichedResponse(userModel, metadata = {}) {
    const userResponse = new UserResponseDTO(userModel);
    
    return {
      ...userResponse,
      metadata: {
        lastLogin: metadata.lastLogin,
        loginCount: metadata.loginCount,
        accountStatus: metadata.accountStatus || 'active',
        profileCompleteness: this.calculateProfileCompleteness(userModel),
        createdAgo: this.getTimeAgo(userModel.createdAt),
        ...metadata
      }
    };
  }

  /**
   * Calculate profile completeness percentage
   * @param {Object} userModel - User model
   * @returns {number} Completeness percentage
   */
  static calculateProfileCompleteness(userModel) {
    const fields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth'];
    const completedFields = fields.filter(field => userModel[field] && userModel[field].trim() !== '');
    return Math.round((completedFields.length / fields.length) * 100);
  }

  /**
   * Get human-readable time ago string
   * @param {Date} date - Date to calculate from
   * @returns {string} Time ago string
   */
  static getTimeAgo(date) {
    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  }

  /**
   * Map request query parameters to user filter object
   * @param {Object} queryParams - URL query parameters
   * @returns {Object} MongoDB filter object
   */
  static mapQueryToFilter(queryParams) {
    const filter = {};
    
    if (queryParams.email) {
      filter.email = { $regex: queryParams.email, $options: 'i' };
    }
    
    if (queryParams.firstName) {
      filter.firstName = { $regex: queryParams.firstName, $options: 'i' };
    }
    
    if (queryParams.lastName) {
      filter.lastName = { $regex: queryParams.lastName, $options: 'i' };
    }
    
    if (queryParams.createdAfter) {
      filter.createdAt = { $gte: new Date(queryParams.createdAfter) };
    }
    
    if (queryParams.createdBefore) {
      filter.createdAt = { 
        ...filter.createdAt, 
        $lte: new Date(queryParams.createdBefore) 
      };
    }
    
    return filter;
  }

  /**
   * Map request query parameters to sort object
   * @param {Object} queryParams - URL query parameters
   * @returns {Object} MongoDB sort object
   */
  static mapQueryToSort(queryParams) {
    const sortBy = queryParams.sortBy || 'createdAt';
    const sortOrder = queryParams.sortOrder === 'asc' ? 1 : -1;
    
    const validSortFields = ['createdAt', 'updatedAt', 'firstName', 'lastName', 'email'];
    
    if (!validSortFields.includes(sortBy)) {
      throw new Error(`Invalid sort field: ${sortBy}`);
    }
    
    return { [sortBy]: sortOrder };
  }

  /**
   * Map user model for export (CSV, Excel)
   * @param {Object} userModel - Database user model
   * @returns {Object} Export-ready object
   */
  static mapModelToExport(userModel) {
    return {
      ID: userModel.id || userModel._id,
      Username: userModel.username,
      Email: userModel.email,
      'First Name': userModel.firstName,
      'Last Name': userModel.lastName,
      Phone: userModel.phone || '',
      'Date of Birth': userModel.dateOfBirth ? new Date(userModel.dateOfBirth).toLocaleDateString() : '',
      'Created Date': new Date(userModel.createdAt).toLocaleDateString(),
      'Last Updated': new Date(userModel.updatedAt).toLocaleDateString()
    };
  }

  /**
   * Map user model for analytics
   * @param {Object} userModel - Database user model
   * @returns {Object} Analytics-ready object
   */
  static mapModelToAnalytics(userModel) {
    return {
      id: userModel.id || userModel._id,
      registrationDate: userModel.createdAt,
      profileComplete: this.calculateProfileCompleteness(userModel) === 100,
      hasPhone: !!userModel.phone,
      hasDateOfBirth: !!userModel.dateOfBirth,
      accountAge: Math.floor((new Date() - new Date(userModel.createdAt)) / (1000 * 60 * 60 * 24))
    };
  }
}
