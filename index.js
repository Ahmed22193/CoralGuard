import express from "express";
import dotenv from "dotenv";
import bootstrap from "./src/app.controller.js";

// Load environment variables
dotenv.config({ path: './src/config/.env' });

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

await bootstrap(app, express);

app.listen(port, () => console.log(`🚀 CoralGuard server listening on port ${port}!`));

export default app;
