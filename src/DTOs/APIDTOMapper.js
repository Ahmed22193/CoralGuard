/**
 * API DTO Mappers
 * Central mapping service that coordinates all DTO mappers
 */

import { UserDTOMapper } from './UserDTOMapper.js';
import { ImageDTOMapper } from './ImageDTOMapper.js';
import { DTOResponseBuilder } from './DTOUtils.js';

export class APIDTOMapper {
  
  /**
   * Get the appropriate mapper for the given entity type
   * @param {string} entityType - Type of entity (user, image, etc.)
   * @returns {Object} Appropriate mapper class
   */
  static getMapper(entityType) {
    const mappers = {
      user: UserDTOMapper,
      image: ImageDTOMapper
    };
    
    const mapper = mappers[entityType.toLowerCase()];
    if (!mapper) {
      throw new Error(`No mapper found for entity type: ${entityType}`);
    }
    
    return mapper;
  }

  /**
   * Generic method to map request to model
   * @param {string} entityType - Type of entity
   * @param {string} operation - Operation type (register, update, upload, etc.)
   * @param {Object} requestData - Request data
   * @param {Object} additionalData - Additional data (files, tokens, etc.)
   * @returns {Object} Mapped model
   */
  static mapRequestToModel(entityType, operation, requestData, additionalData = {}) {
    const mapper = this.getMapper(entityType);
    
    switch (entityType.toLowerCase()) {
      case 'user':
        return this.mapUserRequestToModel(mapper, operation, requestData);
      case 'image':
        return this.mapImageRequestToModel(mapper, operation, requestData, additionalData);
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }
  }

  /**
   * Generic method to map model to response
   * @param {string} entityType - Type of entity
   * @param {string} responseType - Response type (single, list, enriched, etc.)
   * @param {Object|Array} modelData - Model data
   * @param {Object} additionalData - Additional data for response
   * @returns {Object} Mapped response
   */
  static mapModelToResponse(entityType, responseType, modelData, additionalData = {}) {
    const mapper = this.getMapper(entityType);
    
    switch (entityType.toLowerCase()) {
      case 'user':
        return this.mapUserModelToResponse(mapper, responseType, modelData, additionalData);
      case 'image':
        return this.mapImageModelToResponse(mapper, responseType, modelData, additionalData);
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }
  }

  /**
   * Map user request to model
   * @param {Object} mapper - UserDTOMapper
   * @param {string} operation - Operation type
   * @param {Object} requestData - Request data
   * @returns {Object} Mapped model
   */
  static mapUserRequestToModel(mapper, operation, requestData) {
    switch (operation) {
      case 'register':
        return mapper.mapRegisterRequestToModel(requestData);
      case 'login':
        return mapper.mapLoginRequestToCredentials(requestData);
      case 'update':
        return mapper.mapUpdateRequestToModel(requestData);
      default:
        throw new Error(`Unsupported user operation: ${operation}`);
    }
  }

  /**
   * Map user model to response
   * @param {Object} mapper - UserDTOMapper
   * @param {string} responseType - Response type
   * @param {Object|Array} modelData - Model data
   * @param {Object} additionalData - Additional data
   * @returns {Object} Mapped response
   */
  static mapUserModelToResponse(mapper, responseType, modelData, additionalData) {
    switch (responseType) {
      case 'single':
        return mapper.mapModelToResponse(modelData);
      case 'login':
        return mapper.mapModelToLoginResponse(modelData, additionalData.token);
      case 'enriched':
        return mapper.mapModelToEnrichedResponse(modelData, additionalData.metadata);
      case 'array':
        return mapper.mapModelsToResponseArray(modelData);
      case 'export':
        return mapper.mapModelToExport(modelData);
      case 'analytics':
        return mapper.mapModelToAnalytics(modelData);
      default:
        throw new Error(`Unsupported user response type: ${responseType}`);
    }
  }

  /**
   * Map image request to model
   * @param {Object} mapper - ImageDTOMapper
   * @param {string} operation - Operation type
   * @param {Object} requestData - Request data
   * @param {Object} additionalData - Additional data
   * @returns {Object} Mapped model
   */
  static mapImageRequestToModel(mapper, operation, requestData, additionalData) {
    switch (operation) {
      case 'upload':
        return mapper.mapUploadRequestToModel(requestData, additionalData.file, additionalData.cloudinaryData);
      case 'analysis':
        return mapper.mapAnalysisRequestToProcessing(requestData);
      case 'list':
        return mapper.mapListRequestToQuery(requestData);
      default:
        throw new Error(`Unsupported image operation: ${operation}`);
    }
  }

  /**
   * Map image model to response
   * @param {Object} mapper - ImageDTOMapper
   * @param {string} responseType - Response type
   * @param {Object|Array} modelData - Model data
   * @param {Object} additionalData - Additional data
   * @returns {Object} Mapped response
   */
  static mapImageModelToResponse(mapper, responseType, modelData, additionalData) {
    switch (responseType) {
      case 'single':
        return mapper.mapModelToResponse(modelData);
      case 'upload':
        return mapper.mapModelToUploadResponse(modelData, additionalData.message);
      case 'analysis':
        return mapper.mapAnalysisResultsToResponse(modelData);
      case 'list':
        return mapper.mapModelsToListResponse(
          modelData, 
          additionalData.totalCount, 
          additionalData.page, 
          additionalData.limit
        );
      case 'enriched':
        return mapper.mapModelToEnrichedResponse(modelData, additionalData.metadata);
      case 'export':
        return mapper.mapModelToExport(modelData);
      case 'analytics':
        return mapper.mapModelToAnalytics(modelData);
      case 'training':
        return mapper.mapModelToTrainingData(modelData, additionalData.analysisData);
      case 'batch':
        return mapper.mapBatchUploadToResponse(additionalData.successful, additionalData.failed);
      case 'timeline':
        return mapper.mapAnalysisHistoryToTimeline(modelData);
      default:
        throw new Error(`Unsupported image response type: ${responseType}`);
    }
  }

  /**
   * Create standardized API response with mapping
   * @param {string} entityType - Entity type
   * @param {string} responseType - Response type
   * @param {Object|Array} data - Data to map
   * @param {Object} options - Additional options
   * @returns {Object} Standardized API response
   */
  static createAPIResponse(entityType, responseType, data, options = {}) {
    try {
      const mappedData = this.mapModelToResponse(entityType, responseType, data, options.additionalData || {});
      
      if (options.wrapInStandardResponse !== false) {
        return DTOResponseBuilder.success(
          mappedData,
          options.message || 'Operation successful',
          options.statusCode || 200
        );
      }
      
      return mappedData;
    } catch (error) {
      if (options.wrapInStandardResponse !== false) {
        return DTOResponseBuilder.error(
          error.message,
          options.errorStatusCode || 400
        );
      }
      throw error;
    }
  }

  /**
   * Validate and map request data
   * @param {string} entityType - Entity type
   * @param {string} operation - Operation type
   * @param {Object} requestData - Request data
   * @param {Object} additionalData - Additional data
   * @returns {Object} Validation result and mapped data
   */
  static validateAndMapRequest(entityType, operation, requestData, additionalData = {}) {
    try {
      const mappedData = this.mapRequestToModel(entityType, operation, requestData, additionalData);
      
      return {
        isValid: true,
        data: mappedData,
        errors: []
      };
    } catch (error) {
      return {
        isValid: false,
        data: null,
        errors: [error.message]
      };
    }
  }

  /**
   * Batch process multiple items with mapping
   * @param {string} entityType - Entity type
   * @param {string} operation - Operation type
   * @param {Array} items - Array of items to process
   * @param {Object} additionalData - Additional data
   * @returns {Object} Batch processing results
   */
  static batchProcess(entityType, operation, items, additionalData = {}) {
    const successful = [];
    const failed = [];
    
    items.forEach((item, index) => {
      try {
        const result = this.validateAndMapRequest(entityType, operation, item, additionalData);
        if (result.isValid) {
          successful.push({ index, data: result.data, original: item });
        } else {
          failed.push({ index, errors: result.errors, original: item });
        }
      } catch (error) {
        failed.push({ index, errors: [error.message], original: item });
      }
    });
    
    return {
      successful,
      failed,
      summary: {
        total: items.length,
        successCount: successful.length,
        failureCount: failed.length,
        successRate: ((successful.length / items.length) * 100).toFixed(2) + '%'
      }
    };
  }

  /**
   * Get available operations for an entity type
   * @param {string} entityType - Entity type
   * @returns {Array} Available operations
   */
  static getAvailableOperations(entityType) {
    const operations = {
      user: ['register', 'login', 'update'],
      image: ['upload', 'analysis', 'list']
    };
    
    return operations[entityType.toLowerCase()] || [];
  }

  /**
   * Get available response types for an entity type
   * @param {string} entityType - Entity type
   * @returns {Array} Available response types
   */
  static getAvailableResponseTypes(entityType) {
    const responseTypes = {
      user: ['single', 'login', 'enriched', 'array', 'export', 'analytics'],
      image: ['single', 'upload', 'analysis', 'list', 'enriched', 'export', 'analytics', 'training', 'batch', 'timeline']
    };
    
    return responseTypes[entityType.toLowerCase()] || [];
  }
}
