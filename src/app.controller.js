import cors from "cors";
import { gloabelError } from "./Utils/gloabelError.js";
import connectDB from "./DB/ConnectionDB.js";
import AuthRouter from "./Modules/Auth/Auth.controller.js";
import UsersRouter from "./Modules/User/User.controller.js";
import AdminRouter from "./Modules/Admin/Admin.routes.js";
const bootstrap = async (app, express) => {
  app.use(cors());
  await connectDB();

  app.use("/api/auth", AuthRouter);
  app.use("/api/users", UsersRouter);
  app.use("/api/admin", AdminRouter);

  app.all("/*dummyRoute", (req, res, next) => {
    return res.status(404).json({ message: "Dummy Routing" });
  });
  app.use(gloabelError);
};

export default bootstrap;
