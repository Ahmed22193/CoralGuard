import express from "express";
import cors from "cors";

const app = express();
const port = 8080;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

console.log('🚀 Starting simple static server on port 8080...');

// Log all requests
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.url}`);
    next();
});

// Test route
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Simple static server is running!', 
        timestamp: new Date().toISOString()
    });
});

// Test API endpoint
app.get('/api/test', (req, res) => {
    res.status(200).json({ 
        success: true,
        message: 'API is working!',
        timestamp: new Date().toISOString()
    });
});

// Static team members data
const sampleTeamMembers = [
    {
        "_id": "mock1",
        "memberName": "Ahmed Hassan",
        "memberRole": "Project Manager",
        "profileImage": "https://randomuser.me/api/portraits/men/32.jpg",
        "department": "Management",
        "bio": "Experienced project manager with 8+ years in tech industry, specializing in marine conservation projects.",
        "skills": ["Project Management", "Agile", "Team Leadership", "Stakeholder Management"],
        "socialLinks": {
            "linkedin": "https://www.linkedin.com/in/ahmed-hassan",
            "portfolio": "https://ahmed-portfolio.com"
        },
        "displayOrder": 1
    },
    {
        "_id": "mock2",
        "memberName": "Sarah Martinez",
        "memberRole": "Lead Developer",
        "profileImage": "https://randomuser.me/api/portraits/women/22.jpg",
        "department": "Development",
        "bio": "Full-stack developer passionate about environmental technology and sustainable solutions.",
        "skills": ["JavaScript", "Node.js", "React", "MongoDB", "Team Leadership"],
        "socialLinks": {
            "linkedin": "https://www.linkedin.com/in/sarah-martinez",
            "github": "https://github.com/sarah-martinez",
            "portfolio": "https://sarah-dev.com"
        },
        "displayOrder": 2
    },
    {
        "_id": "mock3",
        "memberName": "Dr. Michael Chen",
        "memberRole": "Marine Biologist",
        "profileImage": "https://randomuser.me/api/portraits/men/42.jpg",
        "department": "Research",
        "bio": "PhD in Marine Biology with focus on coral reef ecosystems and climate change impacts.",
        "skills": ["Marine Biology", "Climate Research", "Coral Conservation", "Data Analysis"],
        "socialLinks": {
            "linkedin": "https://www.linkedin.com/in/michael-chen",
            "portfolio": "https://michael-research.edu"
        },
        "displayOrder": 3
    }
];

// Get all team members (static data)
app.get('/api/team-members', (req, res) => {
    console.log('🔍 Returning static team members data...');
    
    res.status(200).json({
        success: true,
        message: 'Team members retrieved successfully',
        statusCode: 200,
        data: {
            count: sampleTeamMembers.length,
            members: sampleTeamMembers
        }
    });
});

// Get team member count
app.get('/api/team-members/count', (req, res) => {
    res.status(200).json({
        success: true,
        count: sampleTeamMembers.length
    });
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Simple static server listening on port ${port}!`);
    console.log(`🌐 Server accessible at http://localhost:${port}`);
});

server.on('error', (error) => {
    console.error(`❌ Server error: ${error.message}`);
});

// Handle termination
process.on('SIGINT', () => {
    console.log('Shutting down server');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
