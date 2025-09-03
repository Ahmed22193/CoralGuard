import express from "express";
import dotenv from "dotenv";
import bootstrap from "./src/app.controller.js";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

console.log(`🔧 Starting server on port ${port}...`);

await bootstrap(app, express);

console.log(`📡 Bootstrap completed, starting server...`);

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 CoralGuard server listening on port ${port}!`);
    console.log(`🌐 Server accessible at http://localhost:${port}`);
    console.log(`🔗 Team Members API: http://localhost:${port}/api/team-members`);
});

export default app;
