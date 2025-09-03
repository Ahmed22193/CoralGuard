import { Router } from "express";
import TeamMemberService from "./TeamMember.service.js";
import { gloabelError } from "../../Utils/gloabelError.js";
import upload from "../../Middlewares/Multer.js";
import cloudinary from "../../Middlewares/cloudinary.js";
import streamifier from "streamifier";

const router = Router();

// Custom Cloudinary upload middleware
const uploadToCloudinary = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "coralguard/team-members",
                public_id: `team-member-${Date.now()}`,
                transformation: [
                    { width: 400, height: 400, crop: "fill", gravity: "face" },
                    { quality: "auto", fetch_format: "auto" }
                ]
            },
            (error, result) => {
                if (error) {
                    return next(new Error(`Cloudinary upload failed: ${error.message}`));
                }
                req.file.secure_url = result.secure_url;
                req.file.public_id = result.public_id;
                next();
            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (error) {
        next(new Error(`Upload processing failed: ${error.message}`));
    }
};

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/team-members/test
 * @desc    Simple test endpoint to verify the controller is working
 * @access  Public
 */
router.get("/test", (req, res) => {
    return res.status(200).json({
        message: "Team Members API is working!",
        timestamp: new Date().toISOString()
    });
});

/**
 * @route   GET /api/team-members
 * @desc    Get all active team members (public endpoint for website)
 * @access  Public
 */
router.get("/", async (req, res, next) => {
    try {
        console.log("🔍 Fetching all team members...");
        const result = await TeamMemberService.getAllMembers();
        console.log(`✅ Found ${result.data?.count || 0} team members`);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.error("❌ Error fetching team members:", error.message);
        next(error);
    }
});

/**
 * @route   GET /api/team-members/role/:role
 * @desc    Get team members by role
 * @access  Public
 */
router.get("/role/:role", async (req, res, next) => {
    try {
        const { role } = req.params;
        const result = await TeamMemberService.getMembersByRole(role);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/team-members/department/:department
 * @desc    Get team members by department
 * @access  Public
 */
router.get("/department/:department", async (req, res, next) => {
    try {
        const { department } = req.params;
        const result = await TeamMemberService.getMembersByDepartment(department);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/team-members/statistics
 * @desc    Get team statistics
 * @access  Public
 */
router.get("/statistics", async (req, res, next) => {
    try {
        const result = await TeamMemberService.getTeamStatistics();
        return res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/team-members/:id
 * @desc    Get single team member by ID
 * @access  Public
 */
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await TeamMemberService.getMemberById(id);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
});

// ==================== ADMIN ROUTES ====================
// Note: Add authentication middleware here for admin routes when available

/**
 * @route   POST /api/team-members/admin/create
 * @desc    Create new team member
 * @access  Admin
 */
router.post("/admin/create", 
    upload.single("profileImage"),
    uploadToCloudinary,
    async (req, res, next) => {
        try {
            const memberData = { ...req.body };
            
            // If image was uploaded via multer/cloudinary, use the secure URL
            if (req.file && req.file.secure_url) {
                memberData.profileImage = req.file.secure_url;
            }
            
            const result = await TeamMemberService.createMember(memberData);
            return res.status(result.statusCode).json(result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   PUT /api/team-members/admin/:id
 * @desc    Update team member
 * @access  Admin
 */
router.put("/admin/:id",
    upload.single("profileImage"),
    uploadToCloudinary,
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };
            
            // If image was uploaded via multer/cloudinary, use the secure URL
            if (req.file && req.file.secure_url) {
                updateData.profileImage = req.file.secure_url;
            }
            
            const result = await TeamMemberService.updateMember(id, updateData);
            return res.status(result.statusCode).json(result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   DELETE /api/team-members/admin/:id
 * @desc    Delete team member
 * @access  Admin
 */
router.delete("/admin/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await TeamMemberService.deleteMember(id);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/team-members/admin/:id/deactivate
 * @desc    Deactivate team member (soft delete)
 * @access  Admin
 */
router.patch("/admin/:id/deactivate", async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await TeamMemberService.deactivateMember(id);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/team-members/admin/:id/activate
 * @desc    Activate team member
 * @access  Admin
 */
router.patch("/admin/:id/activate", async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await TeamMemberService.activateMember(id);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/team-members/admin/:id/order
 * @desc    Update member display order
 * @access  Admin
 */
router.patch("/admin/:id/order", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { displayOrder } = req.body;
        
        if (typeof displayOrder !== 'number') {
            return res.status(400).json({
                success: false,
                message: "Display order must be a number"
            });
        }
        
        const result = await TeamMemberService.updateDisplayOrder(id, displayOrder);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
});

// Global error handler for this router
router.use(gloabelError);

export default router;
