import cors from "cors";
import { gloabelError } from "./Utils/gloabelError.js";
import connectDB from "./DB/ConnectionDB.js";
import AuthRouter from "./Modules/Auth/Auth.controller.js";
import UsersRouter from "./Modules/User/User.controller.js";
import AdminRouter from "./Modules/Admin/Admin.routes.js";
import TeamMemberRouter from "./Modules/TeamMember/TeamMember.controller.js";

const bootstrap = async (app, express) => {
  app.use(cors());
  await connectDB();

  // Add request logging middleware
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.url}`);
    next();
  });

  app.use("/api/auth", AuthRouter);
  app.use("/api/users", UsersRouter);
  app.use("/api/admin", AdminRouter);
  app.use("/api/team-members", TeamMemberRouter);

  // Add a simple test route
  app.get("/api/test", (req, res) => {
    res.json({ message: "Server is working!", timestamp: new Date().toISOString() });
  });

  app.all("/*dummyRoute", (req, res, next) => {
    return res.status(404).json({ message: "Dummy Routing" });
  });
  app.use(gloabelError);
};

export default bootstrap;
