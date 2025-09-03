/**
 * Image DTO Mappers
 * Handle transformations between API requests/responses and database models
 */

import { 
  ImageUploadRequestDTO, 
  ImageResponseDTO, 
  ImageUploadResponseDTO,
  ImageAnalysisRequestDTO,
  ImageAnalysisResponseDTO,
  ImageListRequestDTO,
  ImageListResponseDTO 
} from './ImageDTO.js';

export class ImageDTOMapper {
  
  /**
   * Map image upload request to database model
   * @param {Object} requestBody - Raw request body
   * @param {Object} file - Uploaded file object
   * @param {Object} cloudinaryData - Cloudinary upload response
   * @returns {Object} Database model object
   */
  static mapUploadRequestToModel(requestBody, file, cloudinaryData) {
    const uploadDTO = new ImageUploadRequestDTO(requestBody, file);
    const validation = uploadDTO.validate();
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }
    
    return uploadDTO.toModel(cloudinaryData);
  }

  /**
   * Map database image model to API response
   * @param {Object} imageModel - Database image model
   * @returns {Object} API response object
   */
  static mapModelToResponse(imageModel) {
    return new ImageResponseDTO(imageModel);
  }

  /**
   * Map database image model to upload success response
   * @param {Object} imageModel - Database image model
   * @param {string} message - Success message
   * @returns {Object} Upload response object
   */
  static mapModelToUploadResponse(imageModel, message = 'Image uploaded successfully') {
    return new ImageUploadResponseDTO(imageModel, message);
  }

  /**
   * Map analysis request to processing object
   * @param {Object} requestBody - Raw request body
   * @returns {Object} Analysis request object
   */
  static mapAnalysisRequestToProcessing(requestBody) {
    const analysisDTO = new ImageAnalysisRequestDTO(requestBody);
    const validation = analysisDTO.validate();
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }
    
    return {
      imageId: analysisDTO.imageId,
      analysisType: analysisDTO.analysisType
    };
  }

  /**
   * Map analysis results to response
   * @param {Object} analysisResults - AI analysis results
   * @returns {Object} Analysis response object
   */
  static mapAnalysisResultsToResponse(analysisResults) {
    return new ImageAnalysisResponseDTO(analysisResults);
  }

  /**
   * Map list request query to filter and options
   * @param {Object} queryParams - URL query parameters
   * @returns {Object} Filter and pagination options
   */
  static mapListRequestToQuery(queryParams) {
    const listDTO = new ImageListRequestDTO(queryParams);
    const validation = listDTO.validate();
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }
    
    return {
      filter: listDTO.toFilter(),
      sort: listDTO.toSort(),
      page: listDTO.page,
      limit: listDTO.limit,
      skip: (listDTO.page - 1) * listDTO.limit
    };
  }

  /**
   * Map image models array to paginated response
   * @param {Array} imageModels - Array of database image models
   * @param {number} totalCount - Total number of images
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @returns {Object} Paginated response object
   */
  static mapModelsToListResponse(imageModels, totalCount, page, limit) {
    return ImageListResponseDTO.create(imageModels, totalCount, page, limit);
  }

  /**
   * Map image model with metadata to enriched response
   * @param {Object} imageModel - Database image model
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Enriched image response
   */
  static mapModelToEnrichedResponse(imageModel, metadata = {}) {
    const imageResponse = new ImageResponseDTO(imageModel);
    
    return {
      ...imageResponse,
      metadata: {
        fileSize: metadata.fileSize,
        dimensions: metadata.dimensions,
        analysisCount: metadata.analysisCount || 0,
        downloadCount: metadata.downloadCount || 0,
        tags: metadata.tags || [],
        location: metadata.location,
        uploadedAgo: this.getTimeAgo(imageModel.createdAt),
        ...metadata
      }
    };
  }

  /**
   * Map image model for export (CSV, Excel)
   * @param {Object} imageModel - Database image model
   * @returns {Object} Export-ready object
   */
  static mapModelToExport(imageModel) {
    return {
      ID: imageModel.id || imageModel._id,
      Description: imageModel.description,
      Type: imageModel.type,
      'Health Percentage': imageModel.percentage || 'Not analyzed',
      'User ID': imageModel.userId,
      'Image URL': imageModel.image,
      'Upload Date': new Date(imageModel.createdAt).toLocaleDateString(),
      'Last Updated': new Date(imageModel.updatedAt).toLocaleDateString()
    };
  }

  /**
   * Map image model for analytics dashboard
   * @param {Object} imageModel - Database image model
   * @returns {Object} Analytics-ready object
   */
  static mapModelToAnalytics(imageModel) {
    return {
      id: imageModel.id || imageModel._id,
      type: imageModel.type,
      hasAnalysis: imageModel.percentage !== null && imageModel.percentage !== undefined,
      healthPercentage: imageModel.percentage,
      uploadDate: imageModel.createdAt,
      userId: imageModel.userId,
      daysSinceUpload: Math.floor((new Date() - new Date(imageModel.createdAt)) / (1000 * 60 * 60 * 24))
    };
  }

  /**
   * Map image model for AI training data
   * @param {Object} imageModel - Database image model
   * @param {Object} analysisData - Analysis results
   * @returns {Object} Training data object
   */
  static mapModelToTrainingData(imageModel, analysisData = {}) {
    return {
      imageId: imageModel.id || imageModel._id,
      imageUrl: imageModel.image,
      publicId: imageModel.publicId,
      labels: {
        healthPercentage: imageModel.percentage,
        type: imageModel.type,
        analysisType: analysisData.analysisType,
        confidence: analysisData.confidence,
        features: analysisData.features || []
      },
      metadata: {
        uploadedAt: imageModel.createdAt,
        analyzedAt: analysisData.analyzedAt,
        userId: imageModel.userId
      }
    };
  }

  /**
   * Map batch upload results to response
   * @param {Array} successfulUploads - Successfully uploaded images
   * @param {Array} failedUploads - Failed upload attempts
   * @returns {Object} Batch upload response
   */
  static mapBatchUploadToResponse(successfulUploads, failedUploads) {
    return {
      status: 'completed',
      message: `Batch upload completed: ${successfulUploads.length} successful, ${failedUploads.length} failed`,
      data: {
        successful: successfulUploads.map(upload => new ImageResponseDTO(upload.image)),
        failed: failedUploads.map(failure => ({
          filename: failure.filename,
          error: failure.error,
          reason: failure.reason
        })),
        summary: {
          totalAttempted: successfulUploads.length + failedUploads.length,
          totalSuccessful: successfulUploads.length,
          totalFailed: failedUploads.length,
          successRate: ((successfulUploads.length / (successfulUploads.length + failedUploads.length)) * 100).toFixed(2) + '%'
        }
      }
    };
  }

  /**
   * Map image search request to MongoDB query
   * @param {Object} searchParams - Search parameters
   * @returns {Object} MongoDB search query
   */
  static mapSearchRequestToQuery(searchParams) {
    const query = {};
    
    if (searchParams.description) {
      query.description = { $regex: searchParams.description, $options: 'i' };
    }
    
    if (searchParams.type) {
      query.type = searchParams.type;
    }
    
    if (searchParams.minHealthPercentage !== undefined) {
      query.percentage = { $gte: parseFloat(searchParams.minHealthPercentage) };
    }
    
    if (searchParams.maxHealthPercentage !== undefined) {
      query.percentage = { 
        ...query.percentage, 
        $lte: parseFloat(searchParams.maxHealthPercentage) 
      };
    }
    
    if (searchParams.userId) {
      query.userId = parseInt(searchParams.userId);
    }
    
    if (searchParams.uploadedAfter) {
      query.createdAt = { $gte: new Date(searchParams.uploadedAfter) };
    }
    
    if (searchParams.uploadedBefore) {
      query.createdAt = { 
        ...query.createdAt, 
        $lte: new Date(searchParams.uploadedBefore) 
      };
    }
    
    return query;
  }

  /**
   * Map image model for thumbnail generation
   * @param {Object} imageModel - Database image model
   * @returns {Object} Thumbnail request object
   */
  static mapModelToThumbnailRequest(imageModel) {
    return {
      publicId: imageModel.publicId,
      originalUrl: imageModel.image,
      transformations: {
        width: 300,
        height: 200,
        crop: 'fill',
        quality: 'auto',
        format: 'webp'
      }
    };
  }

  /**
   * Get human-readable time ago string
   * @param {Date} date - Date to calculate from
   * @returns {string} Time ago string
   */
  static getTimeAgo(date) {
    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  }

  /**
   * Map analysis history to timeline response
   * @param {Array} analysisHistory - Array of analysis records
   * @returns {Object} Timeline response
   */
  static mapAnalysisHistoryToTimeline(analysisHistory) {
    return {
      status: 'success',
      message: 'Analysis timeline retrieved',
      data: {
        timeline: analysisHistory.map(analysis => ({
          id: analysis.id,
          analysisType: analysis.analysisType,
          results: {
            percentage: analysis.percentage,
            confidence: analysis.confidence
          },
          analyzedAt: analysis.analyzedAt,
          timeAgo: this.getTimeAgo(analysis.analyzedAt)
        })),
        summary: {
          totalAnalyses: analysisHistory.length,
          averageHealth: analysisHistory.reduce((sum, a) => sum + (a.percentage || 0), 0) / analysisHistory.length,
          latestAnalysis: analysisHistory.length > 0 ? analysisHistory[0].analyzedAt : null
        }
      }
    };
  }
}
