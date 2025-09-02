import UserModel from "../../DB/Models/users.model.js";
import * as dbService from "../../DB/dbService.js";
import SUCCESS from "../../Utils/SuccessfulRes.js";
import { compair, hash } from "../../Utils/hash.utils.js";
import jwt from "jsonwebtoken";

export const signUp = async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await dbService.findOne({
    model: UserModel,
    filter: { email },
  });
  if (user) return next(new Error("User is already exist!", { cause: 404 }));
  const hashedPassword = await hash({ plainText: password });
  const newUser = await dbService.create({
    model: UserModel,
    data: {
      name: name,
      email: email,
      password: hashedPassword,
    },
  });
  SUCCESS(res, 201, "User Created Successfully.", newUser);
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await dbService.findOne({
    model: UserModel,
    filter: { email },
  });
  if (!user)
    return next(
      new Error("User Not Found please signUp first", { cause: 404 })
    );
  const hashedPassword = await compair({
    plainText: password,
    hash: user.password,
  });
  if (!hashedPassword)
    return next(
      new Error("wrong email or password", { cause: 401 })
    );
  const token = jwt.sign(
    {
      _id: user._id,
      email:user.email,
      name: user.name 
    },
    process.env.TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  SUCCESS(res, 200, "User loged Successfully.", token);
};
