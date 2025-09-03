/**
 * Image Data Transfer Objects (DTOs)
 * Used for coral reef image upload and analysis API data transformation
 */

// Image Upload Request DTO
export class ImageUploadRequestDTO {
  constructor(data, file) {
    this.description = data.description;
    this.type = data.type || 'coral_reef';
    this.file = file;
    this.userId = data.userId;
  }

  // Validation method
  validate() {
    const errors = [];
    
    if (!this.file) {
      errors.push('Image file is required');
    } else {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(this.file.mimetype)) {
        errors.push('Only JPEG, PNG, and WebP image formats are allowed');
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (this.file.size > maxSize) {
        errors.push('Image file size must be less than 10MB');
      }
    }
    
    if (!this.userId) {
      errors.push('User ID is required');
    }
    
    if (this.description && typeof this.description !== 'string') {
      errors.push('Description must be a string');
    }
    
    if (this.type && typeof this.type !== 'string') {
      errors.push('Type must be a string');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to model format for database storage
  toModel(cloudinaryData) {
    return {
      image: cloudinaryData.secure_url,
      publicId: cloudinaryData.public_id,
      userId: this.userId,
      type: this.type || 'coral_reef',
      description: this.description || 'Coral reef image',
      percentage: null // Will be set after AI analysis
    };
  }
}

// Image Response DTO
export class ImageResponseDTO {
  constructor(image) {
    this.id = image.id || image._id;
    this.image = image.image;
    this.description = image.description;
    this.percentage = image.percentage;
    this.type = image.type;
    this.userId = image.userId;
    this.publicId = image.publicId;
    this.createdAt = image.createdAt;
    this.updatedAt = image.updatedAt;
  }

  // Static method to create from database model
  static fromModel(image) {
    return new ImageResponseDTO(image);
  }

  // Static method to create array from multiple models
  static fromModelArray(images) {
    return images.map(image => new ImageResponseDTO(image));
  }
}

// Image Upload Success Response DTO
export class ImageUploadResponseDTO {
  constructor(image, message = 'Image uploaded successfully') {
    this.status = 'success';
    this.message = message;
    this.image = new ImageResponseDTO(image);
  }

  // Static method to create upload response
  static create(image, message) {
    return new ImageUploadResponseDTO(image, message);
  }
}

// Image Analysis Request DTO
export class ImageAnalysisRequestDTO {
  constructor(data) {
    this.imageId = data.imageId;
    this.analysisType = data.analysisType || 'coral_health';
  }

  // Validation method
  validate() {
    const errors = [];
    
    if (!this.imageId) {
      errors.push('Image ID is required');
    }
    
    const validAnalysisTypes = ['coral_health', 'species_detection', 'bleaching_assessment'];
    if (this.analysisType && !validAnalysisTypes.includes(this.analysisType)) {
      errors.push('Invalid analysis type. Must be one of: coral_health, species_detection, bleaching_assessment');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Image Analysis Response DTO
export class ImageAnalysisResponseDTO {
  constructor(analysis) {
    this.status = 'success';
    this.message = 'Image analysis completed';
    this.imageId = analysis.imageId;
    this.analysisType = analysis.analysisType;
    this.results = {
      percentage: analysis.percentage,
      confidence: analysis.confidence,
      details: analysis.details,
      recommendations: analysis.recommendations
    };
    this.analyzedAt = analysis.analyzedAt || new Date();
  }

  // Static method to create analysis response
  static create(analysis) {
    return new ImageAnalysisResponseDTO(analysis);
  }
}

// Image List Request DTO (for filtering and pagination)
export class ImageListRequestDTO {
  constructor(query) {
    this.userId = query.userId;
    this.type = query.type;
    this.page = parseInt(query.page) || 1;
    this.limit = parseInt(query.limit) || 10;
    this.sortBy = query.sortBy || 'createdAt';
    this.sortOrder = query.sortOrder || 'desc';
    this.startDate = query.startDate;
    this.endDate = query.endDate;
  }

  // Validation method
  validate() {
    const errors = [];
    
    if (this.page < 1) {
      errors.push('Page must be greater than 0');
    }
    
    if (this.limit < 1 || this.limit > 100) {
      errors.push('Limit must be between 1 and 100');
    }
    
    const validSortFields = ['createdAt', 'updatedAt', 'percentage', 'type'];
    if (!validSortFields.includes(this.sortBy)) {
      errors.push('Invalid sort field');
    }
    
    const validSortOrders = ['asc', 'desc'];
    if (!validSortOrders.includes(this.sortOrder)) {
      errors.push('Sort order must be asc or desc');
    }
    
    if (this.startDate && isNaN(Date.parse(this.startDate))) {
      errors.push('Invalid start date format');
    }
    
    if (this.endDate && isNaN(Date.parse(this.endDate))) {
      errors.push('Invalid end date format');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to MongoDB query filter
  toFilter() {
    const filter = {};
    
    if (this.userId) filter.userId = this.userId;
    if (this.type) filter.type = this.type;
    
    if (this.startDate || this.endDate) {
      filter.createdAt = {};
      if (this.startDate) filter.createdAt.$gte = new Date(this.startDate);
      if (this.endDate) filter.createdAt.$lte = new Date(this.endDate);
    }
    
    return filter;
  }

  // Convert to MongoDB sort object
  toSort() {
    return { [this.sortBy]: this.sortOrder === 'desc' ? -1 : 1 };
  }
}

// Image List Response DTO
export class ImageListResponseDTO {
  constructor(images, totalCount, page, limit) {
    this.status = 'success';
    this.message = 'Images retrieved successfully';
    this.data = ImageResponseDTO.fromModelArray(images);
    this.pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1
    };
  }

  // Static method to create list response
  static create(images, totalCount, page, limit) {
    return new ImageListResponseDTO(images, totalCount, page, limit);
  }
}
