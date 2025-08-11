import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) return next(new Error("Please provide the token", { cause: 401 }));

    const token = authorization.split(' ')[1];
    if (!token) return next(new Error("Invalid token format", { cause: 401 }));

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new Error("Invalid or expired token", { cause: 401 }));
  }
};

export default verifyToken;
