const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_jwt_secret"; // Move this to environment variables

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user info to the request object
    next();
  } catch (error) {
    res.status(401).send({ message: "Unauthorized", error });
  }
};

module.exports = authMiddleware;
