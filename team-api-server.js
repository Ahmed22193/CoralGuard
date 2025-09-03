import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import TeamMember from "./src/DB/Models/teamMember.model.js";

// Load environment variables
dotenv.config({ path: './src/config/.env' });

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
const port = 8080;

console.log('🚀 Starting team member test server on port 8080...');

// Connect to database
const connectDB = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000
        });
        console.log('✅ Database connected successfully!');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Log all requests
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.url}`);
    next();
});

// Test route
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Team Member Test Server is running!', 
        timestamp: new Date().toISOString(),
        endpoints: {
            test: '/api/test',
            allMembers: '/api/team-members',
            memberCount: '/api/team-members/count'
        }
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.status(200).json({ 
        success: true,
        message: 'API is working!',
        timestamp: new Date().toISOString()
    });
});

// Get all team members
app.get('/api/team-members', async (req, res) => {
    try {
        console.log('🔍 Fetching team members...');
        const members = await TeamMember.find().sort({ displayOrder: 1 });
        console.log(`✅ Found ${members.length} team members`);
        
        res.status(200).json({
            success: true,
            message: 'Team members retrieved successfully',
            statusCode: 200,
            data: {
                count: members.length,
                members: members
            }
        });
    } catch (error) {
        console.error('❌ Error fetching team members:', error);
        res.status(500).json({
            success: false,
            message: `Failed to fetch team members: ${error.message}`,
            error: error.toString()
        });
    }
});

// Get team member count
app.get('/api/team-members/count', async (req, res) => {
    try {
        const count = await TeamMember.countDocuments();
        res.status(200).json({
            success: true,
            count: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Failed to count team members: ${error.message}`
        });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Server error occurred',
        error: err.message
    });
});

// Start server
const startServer = async () => {
    const connected = await connectDB();
    if (connected) {
        const server = app.listen(port, '0.0.0.0', () => {
            console.log(`🚀 Team member test server listening on port ${port}!`);
            console.log(`🌐 Server accessible at http://localhost:${port}`);
            console.log(`🔗 Team Members API: http://localhost:${port}/api/team-members`);
        });
        
        server.on('error', (error) => {
            console.error('❌ Server error:', error);
        });
    } else {
        console.error('❌ Server not started due to database connection failure');
        process.exit(1);
    }
};

startServer();
