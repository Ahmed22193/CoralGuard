import UserModel from "../../DB/Models/users.model.js";
import * as dbService from "../../DB/dbService.js";
import SUCCESS from "../../Utils/SuccessfulRes.js";
import { compair, hash } from "../../Utils/hash.utils.js";
import jwt from "jsonwebtoken";

// Import DTO Mappers
import { APIDTOMapper } from "../../DTOs/APIDTOMapper.js";
import { DTOResponseBuilder } from "../../DTOs/DTOUtils.js";

export const signUp = async (req, res, next) => {
  try {
    // Use DTO mapper for request validation and transformation
    const validation = APIDTOMapper.validateAndMapRequest('user', 'register', req.body);
    
    if (!validation.isValid) {
      return res.status(400).json(
        DTOResponseBuilder.validationError(validation.errors)
      );
    }

    const userModel = validation.data;
    
    // Check if user already exists
    const existingUser = await dbService.findOne({
      model: UserModel,
      filter: { email: userModel.email },
    });
    
    if (existingUser) {
      return res.status(409).json(
        DTOResponseBuilder.error("User already exists with this email", 409)
      );
    }

    // Hash password
    const hashedPassword = await hash({ plainText: userModel.password });
    
    // Create user in database
    const newUser = await dbService.create({
      model: UserModel,
      data: {
        name: userModel.firstName + ' ' + userModel.lastName,
        email: userModel.email,
        password: hashedPassword,
        username: userModel.username,
        phone: userModel.phone,
        dateOfBirth: userModel.dateOfBirth
      },
    });

    // Use DTO mapper for response transformation
    const response = APIDTOMapper.createAPIResponse('user', 'single', newUser, {
      message: 'User registered successfully',
      statusCode: 201
    });

    return res.status(201).json(response);
    
  } catch (error) {
    console.error('SignUp error:', error);
    return res.status(500).json(
      DTOResponseBuilder.serverError('Registration failed')
    );
  }
};

export const login = async (req, res, next) => {
  try {
    // Use DTO mapper for request validation and transformation
    const validation = APIDTOMapper.validateAndMapRequest('user', 'login', req.body);
    
    if (!validation.isValid) {
      return res.status(400).json(
        DTOResponseBuilder.validationError(validation.errors)
      );
    }

    const credentials = validation.data;
    
    // Find user by email or username
    const user = await dbService.findOne({
      model: UserModel,
      filter: { 
        $or: [
          { email: credentials.username },
          { username: credentials.username }
        ]
      },
    });
    
    if (!user) {
      return res.status(404).json(
        DTOResponseBuilder.notFound("User not found. Please register first.")
      );
    }

    // Verify password
    const isValidPassword = await compair({
      plainText: credentials.password,
      hash: user.password,
    });
    
    if (!isValidPassword) {
      return res.status(401).json(
        DTOResponseBuilder.unauthorized("Invalid credentials")
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        name: user.name 
      },
      process.env.TOKEN_SECRET || 'fallback-secret',
      { expiresIn: "7d" }
    );

    // Use DTO mapper for login response transformation
    const response = APIDTOMapper.createAPIResponse('user', 'login', user, {
      additionalData: { token },
      message: 'Login successful'
    });

    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json(
      DTOResponseBuilder.serverError('Login failed')
    );
  }
};
