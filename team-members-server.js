import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Enable CORS for all routes with more permissive settings
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create mock data for team members
const teamMembers = [
    {
        id: 1,
        memberName: "Ahmed Hassan",
        memberRole: "Project Manager",
        profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
        department: "Management",
        bio: "Experienced project manager with 8+ years in tech industry.",
        skills: ["Project Management", "Agile", "Leadership"],
        isActive: true,
        displayOrder: 1
    },
    {
        id: 2,
        memberName: "Sarah Martinez",
        memberRole: "Lead Developer",
        profileImage: "https://randomuser.me/api/portraits/women/22.jpg",
        department: "Development",
        bio: "Full-stack developer passionate about sustainable solutions.",
        skills: ["JavaScript", "Node.js", "React"],
        isActive: true,
        displayOrder: 2
    },
    {
        id: 3,
        memberName: "Michael Chen",
        memberRole: "Marine Biologist",
        profileImage: "https://randomuser.me/api/portraits/men/42.jpg",
        department: "Research",
        bio: "Coral reef ecosystems and climate change impacts expert.",
        skills: ["Marine Biology", "Climate Research"],
        isActive: true,
        displayOrder: 3
    }
];

// Root endpoint
app.get("/", (req, res) => {
    res.send(`
        <h1>Team Members API Server</h1>
        <p>Server is running successfully on port ${PORT}</p>
        <p>Available endpoints:</p>
        <ul>
            <li><a href="/api/team-members">/api/team-members</a> - Get all team members</li>
            <li><a href="/api/team-members/count">/api/team-members/count</a> - Get team member count</li>
            <li><a href="/api/health">/api/health</a> - Server health check</li>
        </ul>
    `);
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Get all team members
app.get("/api/team-members", (req, res) => {
    console.log("📥 Request received: GET /api/team-members");
    res.json({
        success: true,
        message: "Team members retrieved successfully",
        data: {
            count: teamMembers.length,
            members: teamMembers
        }
    });
});

// Get team member count
app.get("/api/team-members/count", (req, res) => {
    console.log("📥 Request received: GET /api/team-members/count");
    res.json({
        success: true,
        count: teamMembers.length
    });
});

// Serve HTML viewer file
app.get("/viewer", (req, res) => {
    res.sendFile(path.join(__dirname, "team-members-viewer.html"));
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Team Members API Server running on port ${PORT}`);
    console.log(`🌐 Server available at http://localhost:${PORT}`);
    console.log(`📄 API documentation at http://localhost:${PORT}/`);
    console.log(`👀 Team Members viewer at http://localhost:${PORT}/viewer`);
});

// Write the API documentation to a markdown file
const apiDocs = `# Team Members API Documentation

## Endpoints

### GET /api/team-members
- Returns all team members
- Response format: JSON
- Example response:
\`\`\`json
{
  "success": true,
  "message": "Team members retrieved successfully",
  "data": {
    "count": 3,
    "members": [...]
  }
}
\`\`\`

### GET /api/team-members/count
- Returns the count of team members
- Response format: JSON
- Example response:
\`\`\`json
{
  "success": true,
  "count": 3
}
\`\`\`

### GET /api/health
- Server health check
- Response format: JSON
- Example response:
\`\`\`json
{
  "status": "ok",
  "timestamp": "2025-09-03T12:34:56.789Z",
  "uptime": 123.456
}
\`\`\`
`;

fs.writeFileSync("TEAM-MEMBERS-API-DOCUMENTATION.md", apiDocs);
console.log("📝 API documentation generated: TEAM-MEMBERS-API-DOCUMENTATION.md");
