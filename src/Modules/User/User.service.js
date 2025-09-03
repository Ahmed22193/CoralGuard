// import usersModel from "../../DB/Models/users.model.js";
import { Image } from "../../DB/Models/users.model.js";
import UserModel from "../../DB/Models/users.model.js";
import * as dbService from "../../DB/dbService.js";

import cloudinary from "../../Middlewares/cloudinary.js";
import streamifier from "streamifier";

// Import DTO Mappers
import { APIDTOMapper } from "../../DTOs/APIDTOMapper.js";
import { DTOResponseBuilder } from "../../DTOs/DTOUtils.js";

export const uploadImage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Validate file upload
    if (!req.file) {
      return res.status(400).json(
        DTOResponseBuilder.error("File is required", 400)
      );
    }

    // Prepare request data for DTO validation
    const uploadData = {
      description: req.body.description || 'Coral reef image',
      type: req.body.type || 'coral_reef',
      userId: userId
    };

    // Use DTO mapper for request validation
    const validation = APIDTOMapper.validateAndMapRequest('image', 'upload', uploadData, {
      file: req.file
    });
    
    if (!validation.isValid) {
      return res.status(400).json(
        DTOResponseBuilder.validationError(validation.errors)
      );
    }

    // Determine resource type for Cloudinary
    const resourceType = req.file.mimetype.startsWith("image") ? "image" : "raw";

    // Upload file to Cloudinary
    const uploadedFile = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "CoralGuard",
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    // Use DTO mapper to create database model from validated data and Cloudinary response
    const imageModel = APIDTOMapper.mapRequestToModel('image', 'upload', uploadData, {
      file: req.file,
      cloudinaryData: {
        secure_url: uploadedFile.secure_url,
        public_id: uploadedFile.public_id
      }
    });

    // Save to database
    const savedImage = await Image.create({
      image: imageModel.image,
      publicId: imageModel.publicId,
      userId: imageModel.userId,
      type: imageModel.type,
      description: imageModel.description,
      percentage: imageModel.percentage
    });

    // Use DTO mapper for response transformation
    const response = APIDTOMapper.createAPIResponse('image', 'upload', savedImage, {
      additionalData: { message: 'Image uploaded successfully' },
      statusCode: 200
    });

    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json(
      DTOResponseBuilder.serverError('Image upload failed')
    );
  }
};

export const getImages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Add userId to query parameters
    const queryParams = {
      ...req.query,
      userId: userId
    };

    // Use DTO mapper for request validation and query transformation
    const validation = APIDTOMapper.validateAndMapRequest('image', 'list', queryParams);
    
    if (!validation.isValid) {
      return res.status(400).json(
        DTOResponseBuilder.validationError(validation.errors)
      );
    }

    const queryOptions = validation.data;
    
    // Get images from database
    const images = await dbService.find({
      model: Image,
      filter: queryOptions.filter,
      sort: queryOptions.sort,
      skip: queryOptions.skip,
      limit: queryOptions.limit
    });

    // Get total count for pagination
    const totalCount = await dbService.count({
      model: Image,
      filter: queryOptions.filter
    });

    // Use DTO mapper for response transformation
    const response = APIDTOMapper.createAPIResponse('image', 'list', images, {
      additionalData: {
        totalCount,
        page: queryOptions.page,
        limit: queryOptions.limit
      },
      wrapInStandardResponse: false
    });

    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Get images error:', error);
    return res.status(500).json(
      DTOResponseBuilder.serverError('Failed to retrieve images')
    );
  }
};

export const getImageById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const imageId = req.params.id;

    // Find image by ID and user
    const image = await dbService.findOne({
      model: Image,
      filter: { _id: imageId, userId: userId }
    });

    if (!image) {
      return res.status(404).json(
        DTOResponseBuilder.notFound('Image not found')
      );
    }

    // Use DTO mapper for response transformation with enriched metadata
    const metadata = {
      fileSize: req.query.includeMetadata ? '500KB' : undefined,
      dimensions: req.query.includeMetadata ? { width: 1920, height: 1080 } : undefined,
      analysisCount: 1,
      downloadCount: 0
    };

    const response = APIDTOMapper.createAPIResponse('image', 'enriched', image, {
      additionalData: { metadata },
      message: 'Image retrieved successfully'
    });

    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Get image error:', error);
    return res.status(500).json(
      DTOResponseBuilder.serverError('Failed to retrieve image')
    );
  }
};

export const analyzeImage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const imageId = req.params.id;

    // Verify image belongs to user
    const image = await dbService.findOne({
      model: Image,
      filter: { _id: imageId, userId: userId }
    });

    if (!image) {
      return res.status(404).json(
        DTOResponseBuilder.notFound('Image not found')
      );
    }

    // Prepare analysis request data
    const analysisData = {
      imageId: imageId,
      analysisType: req.body.analysisType || 'coral_health'
    };

    // Use DTO mapper for request validation
    const validation = APIDTOMapper.validateAndMapRequest('image', 'analysis', analysisData);
    
    if (!validation.isValid) {
      return res.status(400).json(
        DTOResponseBuilder.validationError(validation.errors)
      );
    }

    // Simulate AI analysis (replace with actual AI service)
    const mockAnalysis = {
      imageId: imageId,
      analysisType: analysisData.analysisType,
      percentage: Math.floor(Math.random() * 100),
      confidence: 0.85 + Math.random() * 0.15,
      details: 'Coral health analysis completed using advanced AI algorithms',
      recommendations: [
        'Monitor coral bleaching levels',
        'Maintain optimal water quality',
        'Reduce environmental stressors'
      ],
      analyzedAt: new Date()
    };

    // Update image with analysis results
    await dbService.updateOne({
      model: Image,
      filter: { _id: imageId },
      data: { 
        percentage: mockAnalysis.percentage,
        updatedAt: new Date()
      }
    });

    // Use DTO mapper for response transformation
    const response = APIDTOMapper.createAPIResponse('image', 'analysis', mockAnalysis, {
      wrapInStandardResponse: false
    });

    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json(
      DTOResponseBuilder.serverError('Image analysis failed')
    );
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const imageId = req.params.id;

    // Find image by ID and user
    const image = await dbService.findOne({
      model: Image,
      filter: { _id: imageId, userId: userId }
    });

    if (!image) {
      return res.status(404).json(
        DTOResponseBuilder.notFound('Image not found')
      );
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(image.publicId);
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
    }

    // Delete from database
    await dbService.deleteOne({
      model: Image,
      filter: { _id: imageId }
    });

    return res.status(200).json(
      DTOResponseBuilder.success(null, 'Image deleted successfully')
    );
    
  } catch (error) {
    console.error('Delete image error:', error);
    return res.status(500).json(
      DTOResponseBuilder.serverError('Failed to delete image')
    );
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get user from database
    const user = await dbService.findOne({
      model: UserModel,
      filter: { _id: userId }
    });

    if (!user) {
      return res.status(404).json(
        DTOResponseBuilder.notFound('User not found')
      );
    }

    // Get additional metadata
    const imageCount = await dbService.count({
      model: Image,
      filter: { userId: userId }
    });

    const metadata = {
      imageCount,
      accountStatus: 'active',
      lastLogin: new Date(),
      joinedAgo: Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24))
    };

    // Use DTO mapper for response transformation
    const response = APIDTOMapper.createAPIResponse('user', 'enriched', user, {
      additionalData: { metadata },
      message: 'Profile retrieved successfully'
    });

    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json(
      DTOResponseBuilder.serverError('Failed to retrieve profile')
    );
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Use DTO mapper for request validation and transformation
    const validation = APIDTOMapper.validateAndMapRequest('user', 'update', req.body);
    
    if (!validation.isValid) {
      return res.status(400).json(
        DTOResponseBuilder.validationError(validation.errors)
      );
    }

    const updateData = validation.data;
    
    // Update user in database
    const updatedUser = await dbService.updateOne({
      model: UserModel,
      filter: { _id: userId },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    if (!updatedUser) {
      return res.status(404).json(
        DTOResponseBuilder.notFound('User not found')
      );
    }

    // Use DTO mapper for response transformation
    const response = APIDTOMapper.createAPIResponse('user', 'single', updatedUser, {
      message: 'Profile updated successfully'
    });

    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json(
      DTOResponseBuilder.serverError('Failed to update profile')
    );
  }
};
