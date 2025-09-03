import express from "express";
import dotenv from "dotenv";
import bootstrap from "./src/app.controller.js";

// Load environment variables
dotenv.config({ path: './src/config/.env' });

const app = express();
app.use(express.json());

// Enable CORS for all origins
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

const port = process.env.PORT || 3000;

console.log('🚀 Starting CoralGuard server...');
console.log('📍 Port:', port);
console.log('🔗 Environment:', process.env.NODE_ENV || 'development');

try {
    await bootstrap(app, express);
    
    const server = app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 CoralGuard server listening on port ${port}!`);
        console.log(`🌐 Local: http://localhost:${port}`);
        console.log(`🌐 Network: http://0.0.0.0:${port}`);
        console.log('✅ Server is ready to accept connections');
    });

    server.on('error', (error) => {
        console.error('❌ Server error:', error);
        if (error.code === 'EADDRINUSE') {
            console.error(`❌ Port ${port} is already in use. Please stop other services or choose a different port.`);
        }
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down server gracefully...');
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });

} catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
}

export default app;
