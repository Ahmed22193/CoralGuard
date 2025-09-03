# CoralGuard - Marine Conservation Platform

A powerful Node.js backend application for coral reef monitoring and conservation with advanced security features.

## 🌊 Features

- **Complete DTO Mapping System** - Enhanced security with comprehensive data validation
- **JWT Authentication** - Secure user authentication and authorization
- **Image Upload & Analysis** - Cloudinary integration for coral reef image processing
- **MongoDB Integration** - Robust database operations with Mongoose
- **Input Validation** - Advanced data transformation and sanitization
- **RESTful API** - Clean and consistent API endpoints

## 🏗️ Architecture

### Core Components:
- **DTOs (Data Transfer Objects)** - Secure data validation and transformation
- **Authentication Module** - JWT-based user management
- **User Management** - Profile and image operations
- **Database Layer** - MongoDB with enhanced CRUD operations
- **Middleware** - JWT verification, file upload, error handling

### Security Features:
- Input validation on all endpoints
- Data transformation security
- Standardized error handling
- Response consistency
- XSS and injection protection

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AbdallahMohamedDotne/CoralGuard.git
cd CoralGuard
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example src/config/.env
# Edit src/config/.env with your configurations
```

4. **Start the application**
```bash
# Development mode
npm run dev

# Production mode  
npm start
```

## 📁 Project Structure

```
CoralGuard/
├── index.js                 # Application entry point
├── package.json             # Dependencies and scripts
├── vercel.json             # Deployment configuration
└── src/
    ├── DTOs/               # Data Transfer Objects
    │   ├── UserDTO.js      # User validation schemas
    │   ├── ImageDTO.js     # Image validation schemas
    │   ├── DTOUtils.js     # Utility functions
    │   ├── UserDTOMapper.js # User transformations
    │   ├── ImageDTOMapper.js # Image transformations
    │   └── APIDTOMapper.js  # Central mapping coordinator
    ├── Modules/
    │   ├── Auth/           # Authentication module
    │   └── User/           # User management module
    ├── DB/
    │   ├── Models/         # MongoDB models
    │   ├── ConnectionDB.js # Database connection
    │   └── dbService.js    # Database operations
    ├── Middlewares/
    │   ├── VerifyingToken.js # JWT verification
    │   ├── Multer.js       # File upload handling
    │   └── cloudinary.js   # Image storage config
    ├── Utils/              # Utility functions
    └── config/
        └── .env            # Environment configuration
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signUp` - User registration
- `POST /api/auth/login` - User login

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/upload-image` - Upload coral reef image
- `GET /api/users/images` - List user images
- `GET /api/users/images/:id` - Get specific image
- `POST /api/users/images/:id/analyze` - Analyze coral health
- `DELETE /api/users/images/:id` - Delete image

## ⚙️ Configuration

### Environment Variables (.env)
```env
# Database
MONGO_URI=mongodb://localhost:27017/coralguard

# JWT
TOKEN_SECRET=your-jwt-secret-key

# Server
PORT=3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🛡️ Security Features

- **DTO Validation** - All inputs validated through Data Transfer Objects
- **JWT Authentication** - Secure token-based authentication
- **Input Sanitization** - Protection against XSS and injection attacks
- **File Upload Security** - Type and size validation for uploads
- **Error Handling** - Consistent error responses without data leakage

## 🚢 Deployment

### Vercel Deployment
The project includes Vercel configuration for easy deployment:

```bash
npm install -g vercel
vercel
```

### Environment Setup
Ensure all environment variables are configured in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🌊 About CoralGuard

CoralGuard is dedicated to marine conservation through technology, providing tools for coral reef monitoring, health analysis, and conservation efforts worldwide.
