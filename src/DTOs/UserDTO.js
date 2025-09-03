/**
 * User Data Transfer Objects (DTOs)
 * Used for API request/response data transformation
 */

// User Registration Request DTO
export class UserRegisterRequestDTO {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
  }

  // Validation method
  validate() {
    const errors = [];
    
    if (!this.name || typeof this.name !== 'string' || this.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    
    if (!this.email || typeof this.email !== 'string') {
      errors.push('Email is required');
    } else if (!/^\S+@\S+\.\S+$/.test(this.email)) {
      errors.push('Please provide a valid email address');
    }
    
    if (!this.password || typeof this.password !== 'string' || this.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to database model format
  toModel() {
    return {
      name: this.name.trim(),
      email: this.email.toLowerCase().trim(),
      password: this.password
    };
  }
}

// User Login Request DTO
export class UserLoginRequestDTO {
  constructor(data) {
    this.username = data.username;
    this.password = data.password;
  }

  // Validation method
  validate() {
    const errors = [];
    
    if (!this.username || typeof this.username !== 'string' || this.username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (!this.password || typeof this.password !== 'string' || this.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// User Response DTO (for sending user data back to client)
export class UserResponseDTO {
  constructor(user) {
    this.id = user.id || user._id;
    this.name = user.name;
    this.email = user.email;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    // Note: password is never included in response DTOs for security
  }

  // Static method to create from database model
  static fromModel(user) {
    return new UserResponseDTO(user);
  }
}

// User Login Response DTO
export class UserLoginResponseDTO {
  constructor(user, token) {
    this.status = 'success';
    this.message = 'Login successful';
    this.userId = user.id || user._id;
    this.token = token;
    this.user = {
      id: user.id || user._id,
      name: user.name,
      email: user.email
    };
  }

  // Static method to create login response
  static create(user, token) {
    return new UserLoginResponseDTO(user, token);
  }
}

// User Profile Update Request DTO
export class UserUpdateRequestDTO {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
  }

  // Validation method
  validate() {
    const errors = [];
    
    if (this.name !== undefined) {
      if (typeof this.name !== 'string' || this.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
      }
    }
    
    if (this.email !== undefined) {
      if (typeof this.email !== 'string') {
        errors.push('Email must be a string');
      } else if (!/^\S+@\S+\.\S+$/.test(this.email)) {
        errors.push('Please provide a valid email address');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to update object (only include defined fields)
  toUpdateObject() {
    const updateObj = {};
    if (this.name !== undefined) updateObj.name = this.name.trim();
    if (this.email !== undefined) updateObj.email = this.email.toLowerCase().trim();
    return updateObj;
  }
}
