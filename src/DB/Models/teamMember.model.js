import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema({
    memberName: {
        type: String,
        required: [true, "Member name is required"],
        trim: true,
        minlength: [2, "Member name must be at least 2 characters long"],
        maxlength: [50, "Member name cannot exceed 50 characters"]
    },
    memberRole: {
        type: String,
        required: [true, "Member role is required"],
        trim: true,
        enum: {
            values: [
                "Project Manager", 
                "Lead Developer", 
                "Frontend Developer", 
                "Backend Developer", 
                "Full Stack Developer",
                "UI/UX Designer", 
                "DevOps Engineer", 
                "QA Engineer", 
                "Data Scientist", 
                "Marine Biologist",
                "Environmental Researcher",
                "Technical Lead",
                "Marketing Specialist",
                "Community Manager"
            ],
            message: "Invalid member role"
        }
    },
    profileImage: {
        type: String,
        required: [true, "Profile image is required"],
        validate: {
            validator: function(v) {
                // Basic URL validation for image
                return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v) || 
                       /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(v) ||
                       /res\.cloudinary\.com/.test(v);
            },
            message: "Please provide a valid image URL or base64 string"
        }
    },
    department: {
        type: String,
        enum: ["Development", "Design", "Research", "Marketing", "Operations", "Management"],
        default: "Development"
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    bio: {
        type: String,
        maxlength: [500, "Bio cannot exceed 500 characters"],
        trim: true
    },
    skills: [{
        type: String,
        trim: true
    }],
    socialLinks: {
        linkedin: {
            type: String,
            validate: {
                validator: function(v) {
                    return !v || /^https?:\/\/(www\.)?linkedin\.com\//.test(v);
                },
                message: "Please provide a valid LinkedIn URL"
            }
        },
        github: {
            type: String,
            validate: {
                validator: function(v) {
                    return !v || /^https?:\/\/(www\.)?github\.com\//.test(v);
                },
                message: "Please provide a valid GitHub URL"
            }
        },
        portfolio: {
            type: String,
            validate: {
                validator: function(v) {
                    return !v || /^https?:\/\//.test(v);
                },
                message: "Please provide a valid portfolio URL"
            }
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    displayOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
teamMemberSchema.index({ memberRole: 1 });
teamMemberSchema.index({ department: 1 });
teamMemberSchema.index({ isActive: 1 });
teamMemberSchema.index({ displayOrder: 1 });

// Virtual for member's experience duration
teamMemberSchema.virtual('experienceDuration').get(function() {
    const now = new Date();
    const joinDate = this.joinDate;
    const diffTime = Math.abs(now - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
        return `${diffDays} days`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? 's' : ''}`;
    } else {
        const years = Math.floor(diffDays / 365);
        const months = Math.floor((diffDays % 365) / 30);
        return `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}`.trim();
    }
});

// Pre-save middleware to handle image processing
teamMemberSchema.pre('save', function(next) {
    // Ensure displayOrder is set
    if (this.isNew && !this.displayOrder) {
        this.constructor.countDocuments()
            .then(count => {
                this.displayOrder = count + 1;
                next();
            })
            .catch(next);
    } else {
        next();
    }
});

// Static methods
teamMemberSchema.statics.getActiveMembers = function() {
    return this.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
};

teamMemberSchema.statics.getMembersByRole = function(role) {
    return this.find({ memberRole: role, isActive: true }).sort({ displayOrder: 1 });
};

teamMemberSchema.statics.getMembersByDepartment = function(department) {
    return this.find({ department: department, isActive: true }).sort({ displayOrder: 1 });
};

const TeamMember = mongoose.model("TeamMember", teamMemberSchema);

export default TeamMember;
