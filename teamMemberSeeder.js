import mongoose from "mongoose";
import dotenv from "dotenv";
import TeamMember from "./src/DB/Models/teamMember.model.js";

// Load environment variables
dotenv.config();

const sampleTeamMembers = [
    {
        memberName: "Ahmed Hassan",
        memberRole: "Project Manager",
        profileImage: "https://res.cloudinary.com/dcvcwzcod/image/upload/v1/team/ahmed-hassan.jpg",
        department: "Management",
        bio: "Experienced project manager with 8+ years in tech industry, specializing in marine conservation projects.",
        skills: ["Project Management", "Agile", "Team Leadership", "Stakeholder Management"],
        socialLinks: {
            linkedin: "https://www.linkedin.com/in/ahmed-hassan",
            portfolio: "https://ahmed-portfolio.com"
        },
        displayOrder: 1
    },
    {
        memberName: "Sarah Martinez",
        memberRole: "Lead Developer",
        profileImage: "https://res.cloudinary.com/dcvcwzcod/image/upload/v1/team/sarah-martinez.jpg",
        department: "Development",
        bio: "Full-stack developer passionate about environmental technology and sustainable solutions.",
        skills: ["JavaScript", "Node.js", "React", "MongoDB", "Team Leadership"],
        socialLinks: {
            linkedin: "https://www.linkedin.com/in/sarah-martinez",
            github: "https://github.com/sarah-martinez",
            portfolio: "https://sarah-dev.com"
        },
        displayOrder: 2
    },
    {
        memberName: "Dr. Michael Chen",
        memberRole: "Marine Biologist",
        profileImage: "https://res.cloudinary.com/dcvcwzcod/image/upload/v1/team/michael-chen.jpg",
        department: "Research",
        bio: "Marine biologist with PhD in Coral Reef Ecology, dedicated to coral conservation research.",
        skills: ["Marine Biology", "Coral Research", "Data Analysis", "Environmental Science"],
        socialLinks: {
            linkedin: "https://www.linkedin.com/in/dr-michael-chen"
        },
        displayOrder: 3
    },
    {
        memberName: "Emma Johnson",
        memberRole: "UI/UX Designer",
        profileImage: "https://res.cloudinary.com/dcvcwzcod/image/upload/v1/team/emma-johnson.jpg",
        department: "Design",
        bio: "Creative designer focused on creating intuitive interfaces for environmental applications.",
        skills: ["UI/UX Design", "Figma", "Adobe Creative Suite", "User Research"],
        socialLinks: {
            linkedin: "https://www.linkedin.com/in/emma-johnson",
            portfolio: "https://emma-design.portfolio.com"
        },
        displayOrder: 4
    },
    {
        memberName: "James Wilson",
        memberRole: "Backend Developer",
        profileImage: "https://res.cloudinary.com/dcvcwzcod/image/upload/v1/team/james-wilson.jpg",
        department: "Development",
        bio: "Backend specialist with expertise in scalable APIs and database optimization.",
        skills: ["Node.js", "Express.js", "MongoDB", "API Development", "Database Design"],
        socialLinks: {
            linkedin: "https://www.linkedin.com/in/james-wilson",
            github: "https://github.com/james-wilson"
        },
        displayOrder: 5
    },
    {
        memberName: "Lisa Rodriguez",
        memberRole: "Frontend Developer",
        profileImage: "https://res.cloudinary.com/dcvcwzcod/image/upload/v1/team/lisa-rodriguez.jpg",
        department: "Development",
        bio: "Frontend developer creating responsive and accessible web applications.",
        skills: ["React", "JavaScript", "CSS3", "HTML5", "Responsive Design"],
        socialLinks: {
            linkedin: "https://www.linkedin.com/in/lisa-rodriguez",
            github: "https://github.com/lisa-rodriguez",
            portfolio: "https://lisa-frontend.dev"
        },
        displayOrder: 6
    }
];

const seedTeamMembers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000
        });
        console.log("✅ Connected to MongoDB");

        // Clear existing team members
        await TeamMember.deleteMany({});
        console.log("🗑️  Cleared existing team members");

        // Insert sample team members
        const createdMembers = await TeamMember.insertMany(sampleTeamMembers);
        console.log(`🌟 Successfully created ${createdMembers.length} team members:`);
        
        createdMembers.forEach((member, index) => {
            console.log(`   ${index + 1}. ${member.memberName} - ${member.memberRole} (${member.department})`);
        });

        console.log("\n🎉 Team members seeding completed successfully!");
        
        // Display connection info
        console.log("\n📡 Database Connection Info:");
        console.log(`   Database: ${mongoose.connection.name}`);
        console.log(`   Host: ${mongoose.connection.host}`);
        console.log(`   Port: ${mongoose.connection.port}`);
        
    } catch (error) {
        console.error("❌ Error seeding team members:", error.message);
        if (error.errors) {
            Object.values(error.errors).forEach(err => {
                console.error(`   - ${err.message}`);
            });
        }
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log("\n🔌 Database connection closed");
        process.exit(0);
    }
};

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('seed') || args.length === 0) {
    console.log("🌱 Starting team members seeding process...\n");
    seedTeamMembers();
} else {
    console.log("Usage: node teamMemberSeeder.js [seed]");
    process.exit(1);
}
