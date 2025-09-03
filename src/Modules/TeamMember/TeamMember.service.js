import TeamMember from "../../DB/Models/teamMember.model.js";
import { SuccessfulRes } from "../../Utils/SuccessfulRes.js";

class TeamMemberService {
    // Get all team members (public endpoint)
    static async getAllMembers() {
        try {
            console.log("🔄 TeamMemberService: Getting active members from database");
            const members = await TeamMember.getActiveMembers();
            
            if (!members) {
                console.log("⚠️ TeamMemberService: No members returned from database");
                return SuccessfulRes(200, "No team members found", {
                    count: 0,
                    members: []
                });
            }
            
            console.log(`✅ TeamMemberService: Found ${members.length} active members`);
            return SuccessfulRes(200, "Team members retrieved successfully", {
                count: members.length,
                members: members
            });
        } catch (error) {
            console.error(`❌ TeamMemberService Error: ${error.message}`, error);
            throw new Error(`Failed to retrieve team members: ${error.message}`);
        }
    }

    // Get members by role
    static async getMembersByRole(role) {
        try {
            const members = await TeamMember.getMembersByRole(role);
            return SuccessfulRes(200, `Team members with role '${role}' retrieved successfully`, {
                count: members.length,
                role: role,
                members: members
            });
        } catch (error) {
            throw new Error(`Failed to retrieve team members by role: ${error.message}`);
        }
    }

    // Get members by department
    static async getMembersByDepartment(department) {
        try {
            const members = await TeamMember.getMembersByDepartment(department);
            return SuccessfulRes(200, `Team members from '${department}' department retrieved successfully`, {
                count: members.length,
                department: department,
                members: members
            });
        } catch (error) {
            throw new Error(`Failed to retrieve team members by department: ${error.message}`);
        }
    }

    // Get single member by ID
    static async getMemberById(memberId) {
        try {
            const member = await TeamMember.findById(memberId);
            if (!member) {
                throw new Error("Team member not found");
            }
            return SuccessfulRes(200, "Team member retrieved successfully", { member });
        } catch (error) {
            throw new Error(`Failed to retrieve team member: ${error.message}`);
        }
    }

    // Create new team member (admin only)
    static async createMember(memberData) {
        try {
            const newMember = new TeamMember(memberData);
            await newMember.save();
            return SuccessfulRes(201, "Team member created successfully", { member: newMember });
        } catch (error) {
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map(err => err.message);
                throw new Error(`Validation error: ${validationErrors.join(', ')}`);
            }
            throw new Error(`Failed to create team member: ${error.message}`);
        }
    }

    // Update team member (admin only)
    static async updateMember(memberId, updateData) {
        try {
            const updatedMember = await TeamMember.findByIdAndUpdate(
                memberId,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!updatedMember) {
                throw new Error("Team member not found");
            }
            
            return SuccessfulRes(200, "Team member updated successfully", { member: updatedMember });
        } catch (error) {
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map(err => err.message);
                throw new Error(`Validation error: ${validationErrors.join(', ')}`);
            }
            throw new Error(`Failed to update team member: ${error.message}`);
        }
    }

    // Delete team member (admin only)
    static async deleteMember(memberId) {
        try {
            const deletedMember = await TeamMember.findByIdAndDelete(memberId);
            if (!deletedMember) {
                throw new Error("Team member not found");
            }
            return SuccessfulRes(200, "Team member deleted successfully", { deletedMember });
        } catch (error) {
            throw new Error(`Failed to delete team member: ${error.message}`);
        }
    }

    // Soft delete (deactivate) team member
    static async deactivateMember(memberId) {
        try {
            const member = await TeamMember.findByIdAndUpdate(
                memberId,
                { isActive: false },
                { new: true }
            );
            
            if (!member) {
                throw new Error("Team member not found");
            }
            
            return SuccessfulRes(200, "Team member deactivated successfully", { member });
        } catch (error) {
            throw new Error(`Failed to deactivate team member: ${error.message}`);
        }
    }

    // Reactivate team member
    static async activateMember(memberId) {
        try {
            const member = await TeamMember.findByIdAndUpdate(
                memberId,
                { isActive: true },
                { new: true }
            );
            
            if (!member) {
                throw new Error("Team member not found");
            }
            
            return SuccessfulRes(200, "Team member activated successfully", { member });
        } catch (error) {
            throw new Error(`Failed to activate team member: ${error.message}`);
        }
    }

    // Get team statistics
    static async getTeamStatistics() {
        try {
            const totalMembers = await TeamMember.countDocuments({ isActive: true });
            const membersByRole = await TeamMember.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: "$memberRole", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);
            
            const membersByDepartment = await TeamMember.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: "$department", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);

            return SuccessfulRes(200, "Team statistics retrieved successfully", {
                totalMembers,
                membersByRole,
                membersByDepartment
            });
        } catch (error) {
            throw new Error(`Failed to retrieve team statistics: ${error.message}`);
        }
    }

    // Update member display order
    static async updateDisplayOrder(memberId, newOrder) {
        try {
            const member = await TeamMember.findByIdAndUpdate(
                memberId,
                { displayOrder: newOrder },
                { new: true }
            );
            
            if (!member) {
                throw new Error("Team member not found");
            }
            
            return SuccessfulRes(200, "Display order updated successfully", { member });
        } catch (error) {
            throw new Error(`Failed to update display order: ${error.message}`);
        }
    }
}

export default TeamMemberService;
